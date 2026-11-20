"""Google Analytics 4 reports for the admin dashboard (GA4 Data API, read-only).

Configure with two Hugging Face secrets:
  GA_PROPERTY_ID            numeric GA4 property ID, e.g. 512345678
  GA_SERVICE_ACCOUNT_JSON   the full JSON key of a Google Cloud service account
                            that has Viewer access to the GA4 property
Results are cached in memory for a few minutes to stay well inside API quotas.
"""

import json
import logging
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import requests

log = logging.getLogger(__name__)

API = "https://analyticsdata.googleapis.com/v1beta/properties/{pid}:{method}"
SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
CACHE_SECONDS = 600
REALTIME_CACHE_SECONDS = 60

# Custom events sent by the website (src/utils/analytics.js)
TRACKED_EVENTS = {
    "contact_messenger": "Messenger clicks",
    "contact_phone": "Phone taps",
    "contact_text": "Text (SMS) taps",
    "contact_facebook": "Facebook clicks",
    "order_form_sent": "Order forms sent",
    "dish_request": "Dish requests",
    "generate_recipe": "Recipes generated",
    "generate_recipe_failed": "Recipe generation errors",
}

_lock = threading.Lock()
_cache = {}
_creds = None


class AnalyticsNotConfigured(Exception):
    pass


class AnalyticsError(Exception):
    pass


def _property_id():
    return os.getenv("GA_PROPERTY_ID", "").strip().removeprefix("properties/")


def is_configured():
    return bool(_property_id() and os.getenv("GA_SERVICE_ACCOUNT_JSON", "").strip())


def _token():
    global _creds
    if not is_configured():
        raise AnalyticsNotConfigured()
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request

    with _lock:
        if _creds is None:
            try:
                info = json.loads(os.getenv("GA_SERVICE_ACCOUNT_JSON"))
            except ValueError as exc:
                raise AnalyticsError("GA_SERVICE_ACCOUNT_JSON is not valid JSON") from exc
            _creds = service_account.Credentials.from_service_account_info(info, scopes=[SCOPE])
        if not _creds.valid:
            _creds.refresh(Request())
        return _creds.token


def _call(method, body):
    resp = requests.post(
        API.format(pid=_property_id(), method=method),
        json=body,
        headers={"Authorization": f"Bearer {_token()}"},
        timeout=20,
    )
    if resp.status_code != 200:
        try:
            msg = resp.json().get("error", {}).get("message", resp.text)
        except ValueError:
            msg = resp.text
        log.warning("GA4 %s failed (%s): %s", method, resp.status_code, msg[:300])
        if resp.status_code == 403:
            raise AnalyticsError("The service account doesn't have access to this GA4 property yet. "
                                 "Add its email as a Viewer in GA4 > Admin > Property access management.")
        raise AnalyticsError(f"Google Analytics error: {msg[:200]}")
    return resp.json()


def _rows(report, dims, metrics):
    out = []
    for row in report.get("rows", []) or []:
        item = {d: row["dimensionValues"][i]["value"] for i, d in enumerate(dims)}
        for i, m in enumerate(metrics):
            v = row["metricValues"][i]["value"]
            item[m] = float(v) if "." in v else int(v)
        out.append(item)
    return out


def _report(days, dims, metrics, limit=None, order_metric=None, dim_filter=None, order_dim=None):
    body = {
        "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
        "dimensions": [{"name": d} for d in dims],
        "metrics": [{"name": m} for m in metrics],
    }
    if limit:
        body["limit"] = limit
    if order_metric:
        body["orderBys"] = [{"metric": {"metricName": order_metric}, "desc": True}]
    if order_dim:
        body["orderBys"] = [{"dimension": {"dimensionName": order_dim}}]
    if dim_filter:
        body["dimensionFilter"] = dim_filter
    return body


def _cached(key, ttl, fn):
    now = time.time()
    hit = _cache.get(key)
    if hit and now - hit[0] < ttl:
        return hit[1]
    value = fn()
    _cache[key] = (now, value)
    return value


def get_dashboard(days=28):
    """Everything the admin Analytics tab shows, in one call."""
    days = max(1, min(int(days), 365))
    return _cached(("dash", days), CACHE_SECONDS, lambda: _build(days))


def _build(days):
    totals_m = ["activeUsers", "newUsers", "sessions", "screenPageViews",
                "averageSessionDuration", "engagementRate", "eventCount"]
    reports = {
        "totals": ([], totals_m, {}),
        "daily": (["date"], ["activeUsers", "sessions", "screenPageViews"], {"order_dim": "date"}),
        "pages": (["pagePath"], ["screenPageViews", "activeUsers"], {"limit": 15, "order_metric": "screenPageViews"}),
        "channels": (["sessionDefaultChannelGroup"], ["sessions"], {"limit": 10, "order_metric": "sessions"}),
        "sources": (["sessionSource"], ["sessions"], {"limit": 10, "order_metric": "sessions"}),
        "cities": (["city"], ["activeUsers"], {"limit": 10, "order_metric": "activeUsers"}),
        "devices": (["deviceCategory"], ["activeUsers"], {"order_metric": "activeUsers"}),
        "events": (["eventName"], ["eventCount"], {
            "dim_filter": {"filter": {"fieldName": "eventName",
                                      "inListFilter": {"values": list(TRACKED_EVENTS)}}},
        }),
        "recipes": (["pagePath", "pageTitle"], ["screenPageViews"], {
            "limit": 10, "order_metric": "screenPageViews",
            "dim_filter": {"filter": {"fieldName": "pagePath",
                                      "stringFilter": {"matchType": "BEGINS_WITH", "value": "/recipe/"}}},
        }),
    }

    def run(name):
        dims, mets, opts = reports[name]
        return name, _rows(_call("runReport", _report(days, dims, mets, **opts)), dims, mets)

    with ThreadPoolExecutor(max_workers=5) as pool:
        results = dict(pool.map(run, reports))

    totals = results["totals"][0] if results["totals"] else {m: 0 for m in totals_m}
    events = {r["eventName"]: r["eventCount"] for r in results["events"]}
    for r in results["daily"]:
        d = r["date"]
        r["date"] = f"{d[:4]}-{d[4:6]}-{d[6:]}"
    for r in results["recipes"]:
        r["pageTitle"] = r["pageTitle"].replace(" Recipe — Pamangan Recipe Kitchen", "")

    return {
        "configured": True,
        "days": days,
        "totals": totals,
        "daily": results["daily"],
        "pages": results["pages"],
        "channels": results["channels"],
        "sources": results["sources"],
        "cities": results["cities"],
        "devices": results["devices"],
        "events": [{"name": k, "label": v, "count": events.get(k, 0)} for k, v in TRACKED_EVENTS.items()],
        "recipes": results["recipes"],
        "generated_at": int(time.time()),
    }


def get_realtime():
    def build():
        rep = _call("runRealtimeReport", {"metrics": [{"name": "activeUsers"}]})
        rows = rep.get("rows") or []
        return {"active_users": int(rows[0]["metricValues"][0]["value"]) if rows else 0}
    return _cached(("rt",), REALTIME_CACHE_SECONDS, build)


def site_stats(days=28):
    """Numbers from our own database: works even before GA4 is set up."""
    from datetime import datetime, timedelta, timezone
    from services.db_service import get_db

    days = max(1, min(int(days), 365))
    db = get_db()
    since = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=days)
    top = db.recipes.find({}, {"name": 1, "slug": 1, "views": 1, "likes": 1}).sort("views", -1).limit(8)
    views = list(db.recipes.aggregate([{"$group": {"_id": None, "v": {"$sum": "$views"}, "l": {"$sum": "$likes"}}}]))
    requested = db.menu_requests.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {"_id": {"$toLower": "$dish"}, "dish": {"$first": "$dish"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8},
    ])
    return {
        "days": days,
        "recipes_total": db.recipes.count_documents({}),
        "recipes_new": db.recipes.count_documents({"created_at": {"$gte": since}}),
        "recipe_views_total": int(views[0]["v"]) if views else 0,
        "recipe_likes_total": int(views[0]["l"]) if views else 0,
        "menu_requests_new": db.menu_requests.count_documents({"created_at": {"$gte": since}}),
        "top_recipes": [{"name": r.get("name", ""), "slug": r.get("slug") or str(r["_id"]),
                         "views": r.get("views", 0), "likes": r.get("likes", 0)} for r in top],
        "top_requests": [{"dish": r["dish"], "count": r["count"]} for r in requested],
    }
