"""Rate limits for the AI features and admin login.

Events are stored in the `rate_events` collection (MongoDB) so limits hold across
restarts and multiple workers. A TTL index removes events after two days.
Visitors are identified by an HMAC of their IP address; the raw IP is never stored.

Limits are sized to stay inside the free AI tiers (Gemini first, Groq as fallback):
one new recipe costs one AI call of roughly 3-4k tokens.
"""

import hashlib
import hmac
import math
from datetime import datetime, timezone, timedelta

import jwt
from flask import request
from pymongo import ASCENDING

from config import Config
from services.db_service import get_db

HOUR = 3600
DAY = 86400

# bucket: per-visitor windows and site-wide windows as (seconds, max events)
RULES = {
    "generate": {"visitor": [(HOUR, 5), (DAY, 10)], "site": [(DAY, 60)]},
    "grocery": {"visitor": [(HOUR, 10)], "site": []},
    "insight": {"visitor": [(HOUR, 10)], "site": []},  # nutrition + food history
}
# Every AI call from any feature counts toward this daily safety cap
AI_SITE_PER_DAY = 150

LOGIN_MAX_FAILS = 5
LOGIN_WINDOW = 15 * 60

MESSAGES = {
    "generate": "You've made lots of recipes {when}. Please try again in about {wait} 🙂",
    "grocery": "You've made lots of grocery lists {when}. Please try again in about {wait} 🙂",
    "insight": "You've looked up lots of new dish details {when}. Please try again in about {wait} 🙂",
}
SITE_BUSY = (
    "Our recipe kitchen is very busy today. Please try again tomorrow, "
    "or browse the recipes already in our library 🙂"
)


class LimitExceeded(Exception):
    def __init__(self, message, retry_after=60):
        super().__init__(message)
        self.message = message
        self.retry_after = max(1, int(retry_after))


_indexes_ready = False


def _events():
    global _indexes_ready
    col = get_db().rate_events
    if not _indexes_ready:
        col.create_index([("at", ASCENDING)], expireAfterSeconds=2 * DAY)
        col.create_index([("bucket", ASCENDING), ("key", ASCENDING), ("at", ASCENDING)])
        _indexes_ready = True
    return col


def client_ip():
    # Hugging Face Spaces sits behind a proxy; the first forwarded address is the visitor
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    return (request.remote_addr or "unknown")[:64]


def visitor_key():
    return hmac.new(Config.SECRET_KEY.encode(), client_ip().encode(), hashlib.sha256).hexdigest()[:32]


def is_admin():
    """True when the request carries a valid admin token (admins skip AI limits)."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not token:
        return False
    try:
        jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return True
    except jwt.InvalidTokenError:
        return False


def _wait_text(seconds):
    minutes = max(1, math.ceil(seconds / 60))
    if minutes < 60:
        return f"{minutes} minute{'s' if minutes != 1 else ''}"
    hours = math.ceil(minutes / 60)
    return f"{hours} hour{'s' if hours != 1 else ''}"


def _check(col, query, window, limit, now):
    """Return seconds until a slot frees up, or 0 if under the limit."""
    since = now - timedelta(seconds=window)
    q = {**query, "at": {"$gte": since}}
    if col.count_documents(q) < limit:
        return 0
    oldest = col.find_one(q, sort=[("at", ASCENDING)])
    at = oldest["at"] if oldest else now
    if at.tzinfo is None:
        at = at.replace(tzinfo=timezone.utc)
    return max(60, (at + timedelta(seconds=window) - now).total_seconds())


def enforce(bucket):
    """Raise LimitExceeded if this visitor (or the whole site) is over the limit,
    otherwise record the event. Call right before an AI request."""
    if is_admin():
        return
    rules = RULES[bucket]
    col = _events()
    now = datetime.now(timezone.utc)
    key = visitor_key()

    for window, limit in rules["visitor"]:
        wait = _check(col, {"bucket": bucket, "key": key}, window, limit, now)
        if wait:
            when = "this hour" if window <= HOUR else "today"
            raise LimitExceeded(MESSAGES[bucket].format(when=when, wait=_wait_text(wait)), wait)
    for window, limit in rules["site"]:
        wait = _check(col, {"bucket": bucket}, window, limit, now)
        if wait:
            raise LimitExceeded(SITE_BUSY, wait)
    wait = _check(col, {"bucket": {"$in": list(RULES)}}, DAY, AI_SITE_PER_DAY, now)
    if wait:
        raise LimitExceeded(SITE_BUSY, wait)

    col.insert_one({"bucket": bucket, "key": key, "at": now})


# ── Admin login lockout ──────────────────────────────────────────────────────

def login_locked():
    """Seconds left on a lockout for this visitor, or 0."""
    now = datetime.now(timezone.utc)
    return _check(_events(), {"bucket": "login_fail", "key": visitor_key()}, LOGIN_WINDOW, LOGIN_MAX_FAILS, now)


def record_login_failure():
    _events().insert_one({"bucket": "login_fail", "key": visitor_key(), "at": datetime.now(timezone.utc)})


def clear_login_failures():
    _events().delete_many({"bucket": "login_fail", "key": visitor_key()})


def wait_text(seconds):
    return _wait_text(seconds)
