import re
import requests
from datetime import datetime, timezone
from bson import ObjectId
from services.db_service import get_db
from services.ai_service import (
    generate_recipe,
    generate_nutrition,
    generate_history,
)
from models.recipe import create_recipe, serialize_recipe


def _normalize(text):
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def _fetch_pexels_image(recipe_name, cuisine, search_query, used_urls):
    from config import Config
    if not Config.PEXELS_API_KEY:
        return None
    try:
        query = search_query.strip() if search_query else f"{recipe_name} {cuisine} food dish".strip()
        for page in (1, 2):
            resp = requests.get(
                "https://api.pexels.com/v1/search",
                params={"query": query, "per_page": 15, "page": page, "orientation": "landscape"},
                headers={"Authorization": Config.PEXELS_API_KEY},
                timeout=8,
            )
            photos = resp.json().get("photos", []) if resp.ok else []
            url = next(
                (p["src"]["large"] for p in photos if p["src"]["large"] not in used_urls),
                None,
            )
            if url:
                return url
    except Exception:
        pass
    return None


def _fetch_wikipedia_image(recipe_name):
    try:
        resp = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": recipe_name,
                "prop": "pageimages",
                "pithumbsize": 800,
                "format": "json",
                "redirects": 1,
            },
            timeout=8,
            headers={"User-Agent": "pamangan.com/1.0 (recipe platform)"},
        )
        pages = resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            thumb = page.get("thumbnail", {}).get("source")
            if thumb:
                return thumb
    except Exception:
        pass
    return None


def _fetch_and_store_image(recipe_id, recipe_name, cuisine="", search_query=None):
    try:
        db = get_db()
        used_urls = set(
            r["image_url"]
            for r in db.recipes.find(
                {"image_url": {"$exists": True, "$ne": None}},
                {"image_url": 1},
            )
            if r.get("image_url")
        )
        image_url = (
            _fetch_pexels_image(recipe_name, cuisine, search_query, used_urls)
            or _fetch_wikipedia_image(recipe_name)
        )
        if image_url:
            db.recipes.update_one(
                {"_id": ObjectId(recipe_id)},
                {"$set": {"image_url": image_url}},
            )
        return image_url
    except Exception:
        return None


_CUISINE_GROUPS = {
    "asian": (
        r"Japanese|Chinese|Korean|Thai|Vietnamese|Indonesian|"
        r"Malaysian|Taiwanese|Singaporean|Burmese|Cambodian|Laotian|Asian"
    ),
}

_CATEGORY_GROUPS = {
    "healthy": {"$or": [
        {"tags": {"$regex": r"healthy|nutritious|light|vegetarian|vegan|low.fat|diet|salad", "$options": "i"}},
        {"name": {"$regex": r"healthy|salad|vegetable|veggie|light|nutritious", "$options": "i"}},
    ]},
    "snack": {"$or": [
        {"tags": {"$regex": r"snack|appetizer|merienda|finger.food|bites|street.food", "$options": "i"}},
        {"name": {"$regex": r"snack|lumpia|spring.roll|bites|merienda|chips|empanada|kropek", "$options": "i"}},
    ]},
    "dessert": {"$or": [
        {"tags": {"$regex": r"dessert|sweet|pastry|baked|cake|cookie|pudding|ice.cream|kakanin", "$options": "i"}},
        {"name": {"$regex": r"cake|pie|tart|pudding|ice.cream|brownie|cookie|donut|leche.flan|halo.halo|bibingka|puto|kutsinta|palitaw|maja|sapin|biko|mochi|tiramisu|crepe|waffle|pastry|flan|cheesecake|brownie|macaron", "$options": "i"}},
    ]},
    "seafood": {"$or": [
        {"tags": {"$regex": r"seafood|fish|shrimp|prawn|crab|lobster|squid|clam|oyster|mussel", "$options": "i"}},
        {"name": {"$regex": r"fish|shrimp|prawn|crab|lobster|squid|clam|mussel|oyster|salmon|tuna|bangus|tilapia|galunggong|kinilaw|paksiw|ceviche|calamari|scallop|tahong|halaan", "$options": "i"}},
    ]},
    "vegetarian": {"$or": [
        {"tags": {"$regex": r"vegetarian|vegan|meatless|plant.based|meat.free|veggie", "$options": "i"}},
        {"name": {"$regex": r"vegetarian|vegan|tofu|tempeh|veggie|vegetable|lentil|chickpea|bean|mushroom|eggplant|spinach|cauliflower|broccoli|zucchini|paneer", "$options": "i"}},
    ]},
}


def search_recipes(query="", cuisine="", difficulty="", limit=12, page=1):
    db = get_db()
    filt = {}
    if query:
        filt["$text"] = {"$search": query}
    if cuisine and cuisine.lower() not in ("all", ""):
        key = cuisine.lower()
        if key in _CATEGORY_GROUPS:
            filt.update(_CATEGORY_GROUPS[key])
        else:
            pattern = _CUISINE_GROUPS.get(key, re.escape(cuisine))
            filt["cuisine"] = {"$regex": pattern, "$options": "i"}
    if difficulty and difficulty.lower() not in ("all", ""):
        filt["difficulty"] = {"$regex": re.escape(difficulty), "$options": "i"}

    skip = (page - 1) * limit
    cursor = db.recipes.find(filt).skip(skip).limit(limit).sort("created_at", -1)
    total = db.recipes.count_documents(filt)
    return {
        "recipes": [serialize_recipe(r) for r in cursor],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
    }


def get_recipe_by_id(recipe_id):
    db = get_db()
    recipe = None
    try:
        recipe = db.recipes.find_one({"_id": ObjectId(recipe_id)})
    except Exception:
        pass
    if not recipe:
        recipe = db.recipes.find_one({"slug": recipe_id})
    if recipe:
        db.recipes.update_one({"_id": recipe["_id"]}, {"$inc": {"views": 1}})
    result = serialize_recipe(recipe)
    if result and not result.get("image_url"):
        image_url = _fetch_and_store_image(result["id"], result["name"], result.get("cuisine", ""))
        if image_url:
            result["image_url"] = image_url
    return result


def get_recipe_by_name(name):
    db = get_db()
    recipe = db.recipes.find_one(
        {"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}}
    )
    return serialize_recipe(recipe) if recipe else None


def generate_and_save(name):
    existing = get_recipe_by_name(name)
    if existing:
        return existing, False

    data = generate_recipe(name)
    search_query = data.get("image_search_query", "")
    doc = create_recipe(data, source="ai")
    db = get_db()

    slug = doc["slug"]
    base = slug
    counter = 1
    while db.recipes.find_one({"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    doc["slug"] = slug

    result = db.recipes.insert_one(doc)
    doc["_id"] = result.inserted_id
    serialized = serialize_recipe(doc)
    image_url = _fetch_and_store_image(serialized["id"], serialized["name"], serialized.get("cuisine", ""), search_query)
    if image_url:
        serialized["image_url"] = image_url
    return serialized, True


def get_or_generate_nutrition(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return None
    if recipe.get("nutrition"):
        return recipe["nutrition"]
    nutrition = generate_nutrition(recipe["name"], recipe.get("ingredients", []))
    get_db().recipes.update_one(
        {"_id": ObjectId(recipe["id"])},
        {"$set": {"nutrition": nutrition, "updated_at": datetime.now(timezone.utc)}},
    )
    return nutrition


def get_or_generate_history(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return None
    if recipe.get("history"):
        return recipe["history"]
    history = generate_history(recipe["name"])
    get_db().recipes.update_one(
        {"_id": ObjectId(recipe["id"])},
        {"$set": {"history": history, "updated_at": datetime.now(timezone.utc)}},
    )
    return history


def get_popular_recipes(limit=8):
    db = get_db()
    cursor = db.recipes.find().sort("views", -1).limit(limit)
    return [serialize_recipe(r) for r in cursor]


def get_recipes_by_cuisine(cuisine, limit=12, page=1):
    return search_recipes(cuisine=cuisine, limit=limit, page=page)


def get_categories():
    db = get_db()
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 30},
    ]
    return [{"name": r["_id"], "count": r["count"]} for r in db.recipes.aggregate(pipeline)]


def get_all_recipes_admin(page=1, limit=20):
    db = get_db()
    skip = (page - 1) * limit
    cursor = db.recipes.find().skip(skip).limit(limit).sort("created_at", -1)
    total = db.recipes.count_documents({})
    return {
        "recipes": [serialize_recipe(r) for r in cursor],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
    }


def update_recipe(recipe_id, data):
    from datetime import datetime, timezone
    db = get_db()
    try:
        obj_id = ObjectId(recipe_id)
    except Exception:
        return None
    allowed = [
        "name", "description", "cuisine", "cooking_time", "prep_time",
        "servings", "difficulty", "ingredients", "instructions", "tags", "substitutions",
        "image_url",
    ]
    patch = {k: v for k, v in data.items() if k in allowed}
    patch["updated_at"] = datetime.now(timezone.utc)
    updated = db.recipes.find_one_and_update(
        {"_id": obj_id},
        {"$set": patch},
        return_document=True,
    )
    return serialize_recipe(updated)


def delete_recipe(recipe_id):
    db = get_db()
    try:
        result = db.recipes.delete_one({"_id": ObjectId(recipe_id)})
        return result.deleted_count > 0
    except Exception:
        return False


def create_recipe_manual(data):
    from models.recipe import create_recipe
    doc = create_recipe(data, source="manual")
    db = get_db()
    slug = doc["slug"]
    base = slug
    counter = 1
    while db.recipes.find_one({"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    doc["slug"] = slug
    result = db.recipes.insert_one(doc)
    doc["_id"] = result.inserted_id
    serialized = serialize_recipe(doc)
    image_url = _fetch_and_store_image(serialized["id"], serialized["name"], serialized.get("cuisine", ""))
    if image_url:
        serialized["image_url"] = image_url
    return serialized


def refresh_recipe_image(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return None
    return _fetch_and_store_image(recipe["id"], recipe["name"], recipe.get("cuisine", ""))


def get_similar_recipes(recipe_id, limit=4):
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return []
    db = get_db()
    tags = recipe.get("tags", [])
    cuisine = recipe.get("cuisine", "")
    filt = {
        "_id": {"$ne": ObjectId(recipe["id"])},
        "$or": [
            {"tags": {"$in": tags}},
            {"cuisine": {"$regex": re.escape(cuisine), "$options": "i"}},
        ],
    }
    cursor = db.recipes.find(filt).limit(limit)
    return [serialize_recipe(r) for r in cursor]
