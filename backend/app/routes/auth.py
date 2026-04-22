from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app.models.user import User
from app.utils.auth import get_current_user, agent_or_admin_required
from app.utils.responses import success_response, error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return error_response("Request body required")

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password", 401)

    if not user.is_active:
        return error_response("Your account has been deactivated", 403)

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        },
        message="Login successful",
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return error_response("User not found or inactive", 401)

    access_token = create_access_token(identity=user_id)
    return success_response(data={"access_token": access_token})


@auth_bp.route("/me", methods=["GET"])
@agent_or_admin_required
def get_me():
    user = get_current_user()
    return success_response(data=user.to_dict(include_fields=False))


@auth_bp.route("/me", methods=["PUT"])
@agent_or_admin_required
def update_profile():
    from app import db
    user = get_current_user()
    data = request.get_json()

    if not data:
        return error_response("Request body required")

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return error_response("Name cannot be empty")
        user.name = name

    if "password" in data:
        if len(data["password"]) < 6:
            return error_response("Password must be at least 6 characters")
        user.set_password(data["password"])

    db.session.commit()
    return success_response(data=user.to_dict(), message="Profile updated")


@auth_bp.route("/logout", methods=["POST"])
@agent_or_admin_required
def logout():
   
    return success_response(message="Logged out successfully")
