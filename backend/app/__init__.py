from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt

from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"error": "Token has expired", "code": "token_expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token", "code": "token_invalid"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {"error": "Authorization token required", "code": "token_missing"}, 401

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.fields import fields_bp
    from app.routes.users import users_bp
    from app.routes.notes import notes_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(fields_bp, url_prefix="/api/fields")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(notes_bp, url_prefix="/api/notes")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "SmartSeason API", "version": "1.0.0"}

    return app
