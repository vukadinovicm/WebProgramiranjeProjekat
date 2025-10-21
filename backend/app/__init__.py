from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from .config import Config
from .database import db
from . import models  # da migracije vide modele


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS – dozvoli Authorization header za frontend dev origin
    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]}},
        supports_credentials=False,  
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Authorization", "Content-Type"],
    )

    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    # Blueprints
    from .auth import bp as auth_bp
    from .categories import bp_categories
    from .transactions import bp_tx
    from .budgets import bp_budgets
    from .overview import bp_overview

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(bp_categories, url_prefix="/api/categories")
    app.register_blueprint(bp_tx, url_prefix="/api/transactions")
    app.register_blueprint(bp_budgets, url_prefix="/api/budgets")
    app.register_blueprint(bp_overview, url_prefix="/api/overview")

    return app
