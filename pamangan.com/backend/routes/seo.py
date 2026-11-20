"""Lightweight read-only endpoints for the website's SEO layer (sitemap + page meta).

Used by seo.php / sitemap.php on Hostinger. They don't count views and return only
the fields needed for meta tags and structured data.
"""

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, jsonify

from services.db_service import get_db

seo_bp = Blueprint("seo", __name__)

_RECIPE_FIELDS = {
    "name": 1, "slug": 1, "description": 1, "image_url": 1, "cuisine": 1,
    "prep_time": 1, "cooking_time": 1, "servings": 1, "difficulty": 1,
    "ingredients": 1, "instructions": 1, "tags": 1, "nutrition": 1,
    "created_at": 1, "updated_at": 1,
}


def _iso(value):
    return value.isoformat() if hasattr(value, "isoformat") else None


def _cached(resp, seconds):
    resp.headers["Cache-Control"] = f"public, max-age={seconds}"
    return resp


@seo_bp.route("/seo/recipe/<key>", methods=["GET"])
def seo_recipe(key):
    db = get_db()
    doc = None
    try:
        doc = db.recipes.find_one({"_id": ObjectId(key)}, _RECIPE_FIELDS)
    except (InvalidId, TypeError):
        pass
    if not doc:
        doc = db.recipes.find_one({"slug": key[:200]}, _RECIPE_FIELDS)
    if not doc:
        return jsonify({"success": False, "error": "Not found"}), 404
    doc["id"] = str(doc.pop("_id"))
    doc["created_at"] = _iso(doc.get("created_at"))
    doc["updated_at"] = _iso(doc.get("updated_at"))
    return _cached(jsonify({"success": True, "data": doc}), 600)


@seo_bp.route("/seo/sitemap", methods=["GET"])
def seo_sitemap():
    rows = get_db().recipes.find({}, {"slug": 1, "updated_at": 1, "created_at": 1, "image_url": 1, "name": 1})
    items = []
    for r in rows:
        items.append({
            "path": r.get("slug") or str(r["_id"]),
            "name": r.get("name", ""),
            "image": r.get("image_url") or "",
            "lastmod": _iso(r.get("updated_at") or r.get("created_at")),
        })
    return _cached(jsonify({"success": True, "data": items}), 600)
