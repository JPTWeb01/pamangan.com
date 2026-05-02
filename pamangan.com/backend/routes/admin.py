import jwt
import logging
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify
from config import Config
from services.recipe_service import (
    get_all_recipes_admin,
    delete_recipe,
    create_recipe_manual,
)

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        if not token:
            return jsonify({"success": False, "error": "Token required"}), 401
        try:
            jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


@admin_bp.route("/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")
    if not Config.ADMIN_PASSWORD:
        return jsonify({"success": False, "error": "Admin not configured"}), 503
    if username != Config.ADMIN_USERNAME or password != Config.ADMIN_PASSWORD:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401
    token = jwt.encode(
        {"exp": datetime.now(timezone.utc) + timedelta(hours=24)},
        Config.SECRET_KEY,
        algorithm="HS256",
    )
    return jsonify({"success": True, "token": token})


@admin_bp.route("/recipes", methods=["GET"])
@token_required
def list_recipes():
    from routes.api import _int_param
    page = _int_param(request.args.get("page"), 1, minimum=1)
    limit = _int_param(request.args.get("limit"), 20, maximum=100)
    return jsonify({"success": True, "data": get_all_recipes_admin(page, limit)})


@admin_bp.route("/recipes/<recipe_id>", methods=["DELETE"])
@token_required
def remove_recipe(recipe_id):
    deleted = delete_recipe(recipe_id)
    if deleted:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Recipe not found"}), 404


@admin_bp.route("/recipes", methods=["POST"])
@token_required
def add_recipe():
    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    if not name:
        return jsonify({"success": False, "error": "name is required"}), 400
    try:
        recipe = create_recipe_manual(body)
        return jsonify({"success": True, "data": recipe}), 201
    except Exception as exc:
        logger.exception("Error creating manual recipe")
        return jsonify({"success": False, "error": "An unexpected error occurred"}), 500
