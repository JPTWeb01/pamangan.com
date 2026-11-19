import logging
from flask import Blueprint, request, jsonify
from routes.admin import token_required
from routes.api import _int_param
from services.menu_request_service import (
    RequestError,
    STATUSES,
    create_request,
    delete_request,
    is_bot,
    list_requests,
    update_status,
)

logger = logging.getLogger(__name__)

# Public: POST /api/menu-requests
menu_requests_bp = Blueprint("menu_requests", __name__)
# Admin:  /api/admin/menu-requests
admin_menu_requests_bp = Blueprint("admin_menu_requests", __name__)

MAX_BODY_BYTES = 4 * 1024


def _client_ip():
    # Hugging Face Spaces sits behind a proxy; the first forwarded address is the visitor
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    return (request.remote_addr or "unknown")[:64]


@menu_requests_bp.route("/menu-requests", methods=["POST"])
def submit_request():
    if request.content_length is None or request.content_length > MAX_BODY_BYTES:
        return jsonify({"success": False, "error": "Request too large."}), 413
    if not request.is_json:
        return jsonify({"success": False, "error": "Unsupported request."}), 415
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 400

    # Bots get the same answer as people, so they can't tell they were filtered
    if is_bot(body):
        return jsonify({"success": True}), 201

    try:
        create_request(body, _client_ip())
    except RequestError as exc:
        return jsonify({"success": False, "error": exc.message}), exc.status
    except Exception:
        logger.exception("Could not save menu request")
        return jsonify({"success": False, "error": "Could not save your request right now."}), 500
    return jsonify({"success": True}), 201


@admin_menu_requests_bp.route("/menu-requests", methods=["GET"])
@token_required
def admin_list():
    status = request.args.get("status", "")
    page = _int_param(request.args.get("page"), 1, minimum=1, maximum=1000)
    limit = _int_param(request.args.get("limit"), 20, minimum=1, maximum=50)
    return jsonify({"success": True, "data": list_requests(status, page, limit)})


@admin_menu_requests_bp.route("/menu-requests/<request_id>", methods=["PATCH"])
@token_required
def admin_update(request_id):
    body = request.get_json(silent=True) or {}
    status = body.get("status") if isinstance(body, dict) else None
    if status not in STATUSES:
        return jsonify({"success": False, "error": "Invalid status"}), 400
    updated = update_status(request_id, status)
    if not updated:
        return jsonify({"success": False, "error": "Request not found"}), 404
    return jsonify({"success": True, "data": updated})


@admin_menu_requests_bp.route("/menu-requests/<request_id>", methods=["DELETE"])
@token_required
def admin_delete(request_id):
    if delete_request(request_id):
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Request not found"}), 404
