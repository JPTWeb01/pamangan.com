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
    like_recipe,
)
from services.ai_service import generate_grocery_list, NotADishError
from services.rate_limit import enforce, LimitExceeded, visitor_key

api_bp = Blueprint("api", __name__)
logger = logging.getLogger(__name__)

MAX_BODY_BYTES = 16 * 1024
AI_BUSY = "Our recipe kitchen is having trouble right now. Please try again in a minute."


@api_bp.before_request
def _limit_body_size():
    if request.method == "POST" and (request.content_length or 0) > MAX_BODY_BYTES:
        return jsonify({"success": False, "error": "Request too large."}), 413


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


def limited(exc):
    resp = jsonify({"success": False, "error": exc.message})
    resp.headers["Retry-After"] = str(exc.retry_after)
    return resp, 429


def _json_body():
    body = request.get_json(silent=True)
    return body if isinstance(body, dict) else {}


def _str(value):
    return value.strip() if isinstance(value, str) else ""


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


@api_bp.route("/recipes/<recipe_id>/like", methods=["POST"])
def like(recipe_id):
    action = _json_body().get("action", "like")
    if action not in ("like", "unlike"):
        return err("action must be 'like' or 'unlike'")
    result = like_recipe(recipe_id, action, visitor_key())
    if result is None:
        return err("Recipe not found", 404)
    return ok(result)


# ── Search ────────────────────────────────────────────────────────────────────


@api_bp.route("/search", methods=["POST"])
def search():
    body = _json_body()
    query = _str(body.get("query"))[:100]
    if not query:
        return err("query is required")
    return ok(search_recipes(query, _str(body.get("cuisine"))[:60], _str(body.get("difficulty"))[:20]))


# ── AI Generation ─────────────────────────────────────────────────────────────
# AI routes are rate limited per visitor and site-wide (services/rate_limit.py).
# Anything already saved (recipes, nutrition, history) is served without using the AI.

DISH_MIN, DISH_MAX = 2, 60
# Letters (any language), digits, spaces and a few punctuation marks used in dish names
_DISH_CHARS_RE = re.compile(r"^[\w\s'’\-(),.&/]+$")
_LINK_RE = re.compile(r"(https?:|www\.|\.(com|net|org|ru|xyz|io)\b|@)", re.I)
_REPEAT_RE = re.compile(r"(.)\1{3,}")
NOT_A_DISH = "That doesn't look like a dish. Try something like Chicken Adobo or Pancit Canton 🙂"


def _clean_dish_name(raw):
    """Return a tidy dish name, or raise ValueError with a friendly message."""
    name = re.sub(r"\s+", " ", _str(raw))
    if len(name) < DISH_MIN:
        raise ValueError("Please type a dish name.")
    if len(name) > DISH_MAX:
        raise ValueError(f"Please keep the dish name under {DISH_MAX} characters.")
    letters = sum(ch.isalpha() for ch in name)
    if (
        letters < 2
        or "_" in name
        or not _DISH_CHARS_RE.match(name)
        or _LINK_RE.search(name)
        or _REPEAT_RE.search(name.lower())
    ):
        raise ValueError(NOT_A_DISH)
    return name


@api_bp.route("/generate", methods=["POST"])
def generate():
    try:
        name = _clean_dish_name(_json_body().get("name"))
    except ValueError as exc:
        return err(str(exc))
    try:
        recipe, created = generate_and_save(name, before_ai=lambda: enforce("generate"))
        return ok(recipe, 201 if created else 200)
    except LimitExceeded as exc:
        return limited(exc)
    except NotADishError:
        return err(NOT_A_DISH, 422)
    except Exception:
        logger.exception("Error in /generate for name=%r", name)
        return err(AI_BUSY, 503)


# ── Grocery List ──────────────────────────────────────────────────────────────

MAX_GROCERY_RECIPES = 20


@api_bp.route("/grocery", methods=["POST"])
def grocery():
    recipe_ids = _json_body().get("recipe_ids", [])
    if not isinstance(recipe_ids, list) or not recipe_ids:
        return err("recipe_ids is required")
    if len(recipe_ids) > MAX_GROCERY_RECIPES:
        return err(f"Please pick up to {MAX_GROCERY_RECIPES} recipes at a time.")

    ingredients = []
    for rid in dict.fromkeys(r for r in recipe_ids if isinstance(r, str)):
        recipe = get_recipe_by_id(rid)
        if recipe:
            ingredients.extend(recipe.get("ingredients", []))

    if not ingredients:
        return err("No ingredients found for provided recipes", 404)

    try:
        enforce("grocery")
        return ok(generate_grocery_list(ingredients))
    except LimitExceeded as exc:
        return limited(exc)
    except Exception:
        logger.exception("Error in /grocery")
        return err(AI_BUSY, 503)


# ── Nutrition & Food History ──────────────────────────────────────────────────


def _insight(getter, label):
    recipe_id = _str(_json_body().get("recipe_id"))
    if not recipe_id:
        return err("recipe_id is required")
    try:
        data = getter(recipe_id, before_ai=lambda: enforce("insight"))
        return ok(data) if data else err("Recipe not found", 404)
    except LimitExceeded as exc:
        return limited(exc)
    except Exception:
        logger.exception("Error in /%s for recipe_id=%r", label, recipe_id)
        return err(AI_BUSY, 503)


@api_bp.route("/nutrition", methods=["POST"])
def nutrition():
    return _insight(get_or_generate_nutrition, "nutrition")


@api_bp.route("/history", methods=["POST"])
def history():
    return _insight(get_or_generate_history, "history")


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
