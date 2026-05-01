import logging
import re
from flask import Blueprint, request, jsonify
from services.recipe_service import (
    search_recipes,
    get_recipe_by_id,
    generate_and_save,
    get_or_generate_nutrition,
    get_or_generate_history,
    get_categories,
    get_popular_recipes,
    get_recipes_by_cuisine,
    get_similar_recipes,
)
from services.ai_service import generate_grocery_list

api_bp = Blueprint("api", __name__)
logger = logging.getLogger(__name__)


def _int_param(value, default, *, minimum=None, maximum=None):
    try:
        result = int(value)
    except (ValueError, TypeError):
        result = default
    if minimum is not None:
        result = max(minimum, result)
    if maximum is not None:
        result = min(maximum, result)
    return result


def ok(data, status=200):
    return jsonify({"success": True, "data": data}), status


def err(message, status=400):
    return jsonify({"success": False, "error": message}), status


# ── Recipes ──────────────────────────────────────────────────────────────────


@api_bp.route("/recipes", methods=["GET"])
def list_recipes():
    query = request.args.get("q", "")
    cuisine = request.args.get("cuisine", "")
    difficulty = request.args.get("difficulty", "")
    page = _int_param(request.args.get("page"), 1, minimum=1)
    limit = _int_param(request.args.get("limit"), 12, maximum=50)
    return ok(search_recipes(query, cuisine, difficulty, limit, page))


@api_bp.route("/recipes/<recipe_id>", methods=["GET"])
def get_recipe(recipe_id):
    recipe = get_recipe_by_id(recipe_id)
    if not recipe:
        return err("Recipe not found", 404)
    return ok(recipe)


@api_bp.route("/recipes/<recipe_id>/similar", methods=["GET"])
def similar(recipe_id):
    return ok(get_similar_recipes(recipe_id))


# ── Search ────────────────────────────────────────────────────────────────────


@api_bp.route("/search", methods=["POST"])
def search():
    body = request.get_json(silent=True) or {}
    query = body.get("query", "").strip()
    if not query:
        return err("query is required")
    cuisine = body.get("cuisine", "")
    difficulty = body.get("difficulty", "")
    return ok(search_recipes(query, cuisine, difficulty))


# ── AI Generation ─────────────────────────────────────────────────────────────
# TODO: add flask-limiter rate limiting to this endpoint to prevent API quota abuse


@api_bp.route("/generate", methods=["POST"])
def generate():
    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    if not name:
        return err("name is required")
    if len(name) > 100:
        return err("name must be 100 characters or fewer")
    name = re.sub(r'["\'\n\r\\]', '', name).strip()
    if not name:
        return err("name contains invalid characters")
    try:
        recipe, created = generate_and_save(name)
        return ok(recipe, 201 if created else 200)
    except Exception as exc:
        logger.exception("Error in /generate for name=%r", name)
        return err("An unexpected error occurred", 500)


# ── Grocery List ──────────────────────────────────────────────────────────────


@api_bp.route("/grocery", methods=["POST"])
def grocery():
    body = request.get_json(silent=True) or {}
    recipe_ids = body.get("recipe_ids", [])
    if not recipe_ids:
        return err("recipe_ids is required")

    ingredients = []
    for rid in recipe_ids:
        recipe = get_recipe_by_id(rid)
        if recipe:
            ingredients.extend(recipe.get("ingredients", []))

    if not ingredients:
        return err("No ingredients found for provided recipes", 404)

    try:
        return ok(generate_grocery_list(ingredients))
    except Exception as exc:
        logger.exception("Error in /grocery")
        return err("An unexpected error occurred", 500)


# ── Nutrition ─────────────────────────────────────────────────────────────────


@api_bp.route("/nutrition", methods=["POST"])
def nutrition():
    body = request.get_json(silent=True) or {}
    recipe_id = body.get("recipe_id", "").strip()
    if not recipe_id:
        return err("recipe_id is required")
    try:
        data = get_or_generate_nutrition(recipe_id)
        return (ok(data) if data else err("Recipe not found", 404))
    except Exception as exc:
        logger.exception("Error in /nutrition for recipe_id=%r", recipe_id)
        return err("An unexpected error occurred", 500)


# ── Food History ──────────────────────────────────────────────────────────────


@api_bp.route("/history", methods=["POST"])
def history():
    body = request.get_json(silent=True) or {}
    recipe_id = body.get("recipe_id", "").strip()
    if not recipe_id:
        return err("recipe_id is required")
    try:
        data = get_or_generate_history(recipe_id)
        return (ok(data) if data else err("Recipe not found", 404))
    except Exception as exc:
        logger.exception("Error in /history for recipe_id=%r", recipe_id)
        return err("An unexpected error occurred", 500)


# ── Discovery ─────────────────────────────────────────────────────────────────


@api_bp.route("/popular", methods=["GET"])
def popular():
    limit = _int_param(request.args.get("limit"), 8, maximum=20)
    return ok(get_popular_recipes(limit))


@api_bp.route("/categories", methods=["GET"])
def categories():
    return ok(get_categories())


@api_bp.route("/cuisine/<cuisine>", methods=["GET"])
def by_cuisine(cuisine):
    page = _int_param(request.args.get("page"), 1, minimum=1)
    limit = _int_param(request.args.get("limit"), 12, maximum=50)
    return ok(get_recipes_by_cuisine(cuisine, limit, page))
