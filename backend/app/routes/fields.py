from flask import Blueprint, request
from app import db
from app.models.field import Field, STAGES
from app.models.user import User
from app.utils.auth import (
    get_current_user,
    admin_required,
    agent_or_admin_required,
    field_access_required,
)
from app.utils.responses import success_response, error_response, paginated_response
from datetime import date

fields_bp = Blueprint("fields", __name__)


def parse_date(date_str):
    try:
        return date.fromisoformat(date_str)
    except (ValueError, TypeError):
        return None


@fields_bp.route("", methods=["GET"])
@agent_or_admin_required
def get_fields():
    user = get_current_user()
    query = Field.query.filter_by(is_active=True)

    
    if user.role == "agent":
        query = query.filter_by(agent_id=user.id)

   
    stage = request.args.get("stage")
    if stage and stage in STAGES:
        query = query.filter_by(stage=stage)

    agent_id = request.args.get("agent_id")
    if agent_id and user.role == "admin":
        query = query.filter_by(agent_id=int(agent_id))

    search = request.args.get("search", "").strip()
    if search:
        query = query.filter(
            Field.name.ilike(f"%{search}%") | Field.crop_type.ilike(f"%{search}%")
        )

    
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))
    pagination = query.order_by(Field.updated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    fields_data = [f.to_dict(include_notes=True) for f in pagination.items]

   
    status_filter = request.args.get("status")
    if status_filter and status_filter in ("Active", "At Risk", "Completed"):
        fields_data = [f for f in fields_data if f["status"] == status_filter]

    return success_response(data={
        "fields": fields_data,
        "total": len(fields_data),
        "page": page,
        "per_page": per_page,
    })


@fields_bp.route("/<int:field_id>", methods=["GET"])
@field_access_required
def get_field(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)
    return success_response(data=field.to_dict(include_notes=True))


@fields_bp.route("", methods=["POST"])
@admin_required
def create_field():
    data = request.get_json()
    if not data:
        return error_response("Request body required")

    name = data.get("name", "").strip()
    crop_type = data.get("crop_type", "").strip()
    planting_date_str = data.get("planting_date")
    agent_id = data.get("agent_id")

    if not name:
        return error_response("Field name is required")
    if not crop_type:
        return error_response("Crop type is required")
    if not planting_date_str:
        return error_response("Planting date is required")
    if not agent_id:
        return error_response("Field agent is required")

    planting_date = parse_date(planting_date_str)
    if not planting_date:
        return error_response("Invalid planting date format. Use YYYY-MM-DD")

    agent = User.query.filter_by(id=agent_id, role="agent", is_active=True).first()
    if not agent:
        return error_response("Agent not found or invalid")

    stage = data.get("stage", "Planted")
    if stage not in STAGES:
        return error_response(f"Stage must be one of: {', '.join(STAGES)}")

    current_user = get_current_user()
    field = Field(
        name=name,
        crop_type=crop_type,
        planting_date=planting_date,
        stage=stage,
        agent_id=agent_id,
        created_by=current_user.id,
        location=data.get("location", "").strip() or None,
        area_hectares=data.get("area_hectares") or None,
    )

    db.session.add(field)
    db.session.commit()

    return success_response(
        data=field.to_dict(include_notes=True),
        message="Field created successfully",
        status_code=201,
    )


@fields_bp.route("/<int:field_id>", methods=["PUT"])
@admin_required
def update_field(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)

    data = request.get_json()
    if not data:
        return error_response("Request body required")

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return error_response("Field name cannot be empty")
        field.name = name

    if "crop_type" in data:
        crop_type = data["crop_type"].strip()
        if not crop_type:
            return error_response("Crop type cannot be empty")
        field.crop_type = crop_type

    if "planting_date" in data:
        planting_date = parse_date(data["planting_date"])
        if not planting_date:
            return error_response("Invalid planting date format")
        field.planting_date = planting_date

    if "stage" in data:
        if data["stage"] not in STAGES:
            return error_response(f"Stage must be one of: {', '.join(STAGES)}")
        field.stage = data["stage"]

    if "agent_id" in data:
        agent = User.query.filter_by(
            id=data["agent_id"], role="agent", is_active=True
        ).first()
        if not agent:
            return error_response("Agent not found or invalid")
        field.agent_id = data["agent_id"]

    if "location" in data:
        field.location = data["location"].strip() or None

    if "area_hectares" in data:
        field.area_hectares = data["area_hectares"] or None

    db.session.commit()
    return success_response(
        data=field.to_dict(include_notes=True),
        message="Field updated successfully",
    )


@fields_bp.route("/<int:field_id>/stage", methods=["PATCH"])
@field_access_required
def update_stage(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)

    data = request.get_json()
    if not data:
        return error_response("Request body required")

    new_stage = data.get("stage")
    if not new_stage or new_stage not in STAGES:
        return error_response(f"Stage must be one of: {', '.join(STAGES)}")

    old_stage = field.stage
    field.stage = new_stage
    db.session.commit()

    return success_response(
        data=field.to_dict(include_notes=True),
        message=f"Stage updated from {old_stage} to {new_stage}",
    )


@fields_bp.route("/<int:field_id>", methods=["DELETE"])
@admin_required
def delete_field(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)

    field.is_active = False 
    db.session.commit()
    return success_response(message="Field deleted successfully")
