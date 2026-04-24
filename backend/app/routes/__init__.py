from app.routes.auth import auth_bp
from app.routes.fields import fields_bp
from app.routes.users import users_bp
from app.routes.notes import notes_bp
from app.routes.dashboard import dashboard_bp

__all__ = ["auth_bp", "fields_bp", "users_bp", "notes_bp", "dashboard_bp"]
