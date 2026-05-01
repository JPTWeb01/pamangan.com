from flask import Flask
from flask_cors import CORS
from config import Config
from routes.api import api_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return {"status": "ok", "app": "pamangan.com"}

    @app.errorhandler(404)
    def not_found(_):
        return {"success": False, "error": "Not found"}, 404

    @app.errorhandler(500)
    def server_error(_):
        return {"success": False, "error": "Internal server error"}, 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=Config.DEBUG, host="0.0.0.0", port=5000)
