"""Dish requests sent from the Menu page ("Request a dish").

Visitors can suggest dishes they'd like Pamangan to cook. Requests are stored in
the `menu_requests` collection and reviewed in the admin dashboard.

Spam / abuse protection lives here so the route stays thin:
  * strict validation (types, lengths, control characters, no links)
  * honeypot field and minimum fill time (bots get a fake success, nothing saved)
  * per-visitor rate limit and duplicate suppression (hashed IP, never stored raw)
  * a global daily cap so the database can't be flooded
"""

import hashlib
import hmac
import re
import unicodedata
from datetime import datetime, timezone, timedelta

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import DESCENDING

from config import Config
from services.db_service import get_db

STATUSES = ("new", "considering", "added", "declined")

FIELD_LIMITS = {
    # field: (min length, max length, required)
    "dish": (2, 80, True),
    "name": (2, 60, True),
    "contact": (0, 80, False),
    "message": (0, 500, False),
}

PER_VISITOR_PER_HOUR = 3
PER_VISITOR_PER_DAY = 8
GLOBAL_PER_DAY = 300
MIN_FILL_MS = 2500  # humans need a few seconds to type a dish and a name

_LINK_RE = re.compile(r"(https?://|www\.|\.(com|net|org|ru|xyz|top|info|biz)\b|<[a-z/])", re.I)
_SPACES_RE = re.compile(r"[ \t]+")
# Contact may be an email or a Facebook profile, so only block real links/markup there
_CONTACT_LINK_RE = re.compile(r"(https?://|www\.|<[a-z/])", re.I)


class RequestError(Exception):
    """Validation problem to show the visitor (safe, friendly message)."""

    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


_indexes_ready = False


def _collection():
    global _indexes_ready
    col = get_db().menu_requests
    if not _indexes_ready:
        col.create_index([("created_at", DESCENDING)])
        col.create_index([("ip_hash", 1), ("created_at", DESCENDING)])
        col.create_index([("status", 1), ("created_at", DESCENDING)])
        col.create_index([("dish_key", 1)])
        _indexes_ready = True
    return col


def _clean(value, *, multiline=False):
    """Normalise text: NFC, strip control characters, collapse spaces."""
    if value is None:
        return ""
    if not isinstance(value, str):
        raise RequestError("Please use plain text only.")
    value = unicodedata.normalize("NFC", value)
    allowed = {"\n"} if multiline else set()
    value = "".join(
        ch for ch in value
        if ch in allowed or unicodedata.category(ch)[0] != "C"
    )
    if multiline:
        lines = [_SPACES_RE.sub(" ", ln).strip() for ln in value.split("\n")]
        value = re.sub(r"\n{3,}", "\n\n", "\n".join(lines))
    else:
        value = _SPACES_RE.sub(" ", value)
    return value.strip()


def _hash_ip(ip):
    return hmac.new(Config.SECRET_KEY.encode(), (ip or "unknown").encode(), hashlib.sha256).hexdigest()[:32]


def _dish_key(dish):
    return re.sub(r"[^a-z0-9]+", " ", dish.lower()).strip()


def validate(body):
    if not isinstance(body, dict):
        raise RequestError("Something went wrong. Please try again.")
    data = {}
    labels = {"dish": "the dish", "name": "your name", "contact": "your contact", "message": "your message"}
    for field, (low, high, required) in FIELD_LIMITS.items():
        value = _clean(body.get(field), multiline=field == "message")
        if required and not value:
            raise RequestError(f"Please add {labels[field]}.")
        if value and len(value) < low:
            raise RequestError(f"Please add a little more for {labels[field]}.")
        if len(value) > high:
            raise RequestError(f"Please keep {labels[field]} under {high} characters.")
        pattern = _CONTACT_LINK_RE if field == "contact" else _LINK_RE
        if value and pattern.search(value):
            raise RequestError("Please leave out links — just tell us about the dish.")
        data[field] = value
    return data


def is_bot(body):
    """Honeypot filled or the form was submitted impossibly fast."""
    if not isinstance(body, dict):
        return True
    if str(body.get("website") or "").strip():
        return True
    try:
        elapsed = int(body.get("t", 0))
    except (TypeError, ValueError):
        return True
    return elapsed < MIN_FILL_MS


def create_request(body, ip):
    """Validate and store a request. Returns True if saved (or silently ignored as duplicate)."""
    data = validate(body)
    col = _collection()
    now = datetime.now(timezone.utc)
    ip_hash = _hash_ip(ip)

    if col.count_documents({"created_at": {"$gte": now - timedelta(days=1)}}) >= GLOBAL_PER_DAY:
        raise RequestError("We're getting a lot of requests today. Please message us on Facebook instead.", 429)
    if col.count_documents({"ip_hash": ip_hash, "created_at": {"$gte": now - timedelta(hours=1)}}) >= PER_VISITOR_PER_HOUR:
        raise RequestError("Thanks for all the ideas! Please try again in a little while.", 429)
    if col.count_documents({"ip_hash": ip_hash, "created_at": {"$gte": now - timedelta(days=1)}}) >= PER_VISITOR_PER_DAY:
        raise RequestError("Thanks for all the ideas! Please try again tomorrow.", 429)

    key = _dish_key(data["dish"])
    if col.find_one({"ip_hash": ip_hash, "dish_key": key, "created_at": {"$gte": now - timedelta(days=1)}}):
        return True  # same visitor, same dish today: already have it

    col.insert_one({
        **data,
        "dish_key": key,
        "status": "new",
        "ip_hash": ip_hash,
        "created_at": now,
        "updated_at": now,
    })
    return True


# ── Admin ────────────────────────────────────────────────────────────────────

def _serialize(doc):
    created = doc.get("created_at")
    if created and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return {
        "id": str(doc["_id"]),
        "dish": doc.get("dish", ""),
        "name": doc.get("name", ""),
        "contact": doc.get("contact", ""),
        "message": doc.get("message", ""),
        "status": doc.get("status", "new"),
        "created_at": created.isoformat() if created else None,
    }


def _oid(request_id):
    try:
        return ObjectId(str(request_id))
    except (InvalidId, TypeError):
        return None


def list_requests(status=None, page=1, limit=20):
    col = _collection()
    query = {"status": status} if status in STATUSES else {}
    total = col.count_documents(query)
    docs = (
        col.find(query, {"ip_hash": 0})
        .sort("created_at", DESCENDING)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    counts = {s: 0 for s in STATUSES}
    for row in col.aggregate([{"$group": {"_id": "$status", "n": {"$sum": 1}}}]):
        if row["_id"] in counts:
            counts[row["_id"]] = row["n"]
    top = [
        {"dish": row["dish"], "count": row["n"]}
        for row in col.aggregate([
            {"$match": {"status": {"$ne": "declined"}}},
            {"$sort": {"created_at": -1}},
            {"$group": {"_id": "$dish_key", "dish": {"$first": "$dish"}, "n": {"$sum": 1}}},
            {"$sort": {"n": -1, "dish": 1}},
            {"$limit": 6},
        ])
    ]
    return {
        "requests": [_serialize(d) for d in docs],
        "total": total,
        "page": page,
        "pages": max(1, -(-total // limit)),
        "counts": counts,
        "top": top,
    }


def update_status(request_id, status):
    oid = _oid(request_id)
    if not oid or status not in STATUSES:
        return None
    doc = _collection().find_one_and_update(
        {"_id": oid},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}},
        projection={"ip_hash": 0},
        return_document=True,
    )
    return _serialize(doc) if doc else None


def delete_request(request_id):
    oid = _oid(request_id)
    if not oid:
        return False
    return _collection().delete_one({"_id": oid}).deleted_count == 1
