from flask import Flask
from flask_cors import CORS
from config import Config
from routes.api import api_bp
from routes.admin import admin_bp
from routes.menu_requests import menu_requests_bp, admin_menu_requests_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # hard cap for any request (image uploads)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(menu_requests_bp, url_prefix="/api")
    app.register_blueprint(admin_menu_requests_bp, url_prefix="/api/admin")

    @app.after_request
    def add_security_headers(response):
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = "default-src 'none'"
        if not app.config.get("DEBUG"):
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @app.route("/health")
    def health():
        return {"status": "ok", "app": "pamangan.com"}

    @app.errorhandler(404)
    def not_found(_):
        return {"success": False, "error": "Not found"}, 404

    @app.errorhandler(413)
    def too_large(_):
        return {"success": False, "error": "Request too large."}, 413

    @app.errorhandler(405)
    def not_allowed(_):
        return {"success": False, "error": "Method not allowed"}, 405

    @app.errorhandler(500)
    def server_error(_):
        return {"success": False, "error": "Internal server error"}, 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=Config.DEBUG, host="0.0.0.0", port=5000)
