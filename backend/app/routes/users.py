from flask import Blueprint, request
from app import db
from app.models.user import User
from app.models.field import Field
from app.utils.auth import get_current_user, admin_required, agent_or_admin_required
from app.utils.responses import success_response, error_response

users_bp = Blueprint("users", __name__)


@users_bp.route("", methods=["GET"])
@admin_required
def get_users():
    role = request.args.get("role")
    query = User.query.filter_by(is_active=True)
    if role in ("admin", "agent"):
        query = query.filter_by(role=role)
    users = query.order_by(User.name).all()
    return success_response(data=[u.to_dict() for u in users])


@users_bp.route("/agents", methods=["GET"])
@agent_or_admin_required
def get_agents():
    agents = User.query.filter_by(role="agent", is_active=True).order_by(User.name).all()
    return success_response(data=[a.to_dict() for a in agents])


@users_bp.route("/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response(data=user.to_dict(include_fields=True))


@users_bp.route("", methods=["POST"])
@admin_required
def create_user():
    data = request.get_json()
    if not data:
        return error_response("Request body required")

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "agent")

    if not name:
        return error_response("Name is required")
    if not email:
        return error_response("Email is required")
    if not password or len(password) < 6:
        return error_response("Password must be at least 6 characters")
    if role not in ("admin", "agent"):
        return error_response("Role must be 'admin' or 'agent'")

    if User.query.filter_by(email=email).first():
        return error_response("Email already registered", 409)

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return success_response(
        data=user.to_dict(),
        message="User created successfully",
        status_code=201,
    )


@users_bp.route("/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    data = request.get_json()
    if not data:
        return error_response("Request body required")

    if "name" in data:
        user.name = data["name"].strip()
    if "email" in data:
        email = data["email"].strip().lower()
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user_id:
            return error_response("Email already in use", 409)
        user.email = email
    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            return error_response("Password must be at least 6 characters")
        user.set_password(data["password"])
    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    db.session.commit()
    return success_response(data=user.to_dict(), message="User updated")


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    current = get_current_user()
    if current.id == user_id:
        return error_response("Cannot delete your own account", 400)

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    user.is_active = False
    db.session.commit()
    return success_response(message="User deactivated")
