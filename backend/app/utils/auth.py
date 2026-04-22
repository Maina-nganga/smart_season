from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User


def get_current_user():
    """Get the currently authenticated user."""
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))


def admin_required(fn):
    """Decorator: only admin users allowed."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


def agent_or_admin_required(fn):
    """Decorator: both agents and admins allowed."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        if not user.is_active:
            return jsonify({"error": "Account is deactivated"}), 403
        return fn(*args, **kwargs)
    return wrapper


def field_access_required(fn):
    """
    Decorator: admin can access any field.
    Agent can only access their assigned fields.
    Expects field_id as URL param or in the kwargs.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401

        if user.role == "admin":
            return fn(*args, **kwargs)

        from app.models.field import Field
        field_id = kwargs.get("field_id")
        if field_id:
            field = Field.query.get(field_id)
            if not field:
                return jsonify({"error": "Field not found"}), 404
            if field.agent_id != user.id:
                return jsonify({"error": "Access denied: field not assigned to you"}), 403

        return fn(*args, **kwargs)
    return wrapper
