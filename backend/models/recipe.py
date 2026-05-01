import re
from datetime import datetime, timezone


def create_recipe(data, source="manual"):
    name = data.get("name", "")
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "slug": slug,
        "description": data.get("description", ""),
        "cuisine": data.get("cuisine", "Global"),
        "cooking_time": data.get("cooking_time", ""),
        "prep_time": data.get("prep_time", ""),
        "servings": int(data.get("servings", 4)),
        "difficulty": data.get("difficulty", "Medium"),
        "ingredients": data.get("ingredients", []),
        "instructions": data.get("instructions", []),
        "tags": data.get("tags", []),
        "substitutions": data.get("substitutions", []),
        "nutrition": data.get("nutrition", None),
        "history": data.get("history", None),
        "image_url": data.get("image_url", None),
        "rating": float(data.get("rating", 0)),
        "views": 0,
        "source": source,
        "created_at": now,
        "updated_at": now,
    }


def serialize_recipe(recipe):
    if recipe is None:
        return None
    recipe = dict(recipe)
    if "_id" in recipe:
        recipe["id"] = str(recipe.pop("_id"))
    for field in ("created_at", "updated_at"):
        if field in recipe and hasattr(recipe[field], "isoformat"):
            recipe[field] = recipe[field].isoformat()
    return recipe
