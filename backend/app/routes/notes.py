from flask import Blueprint, request
from app import db
from app.models.note import FieldNote
from app.models.field import Field
from app.utils.auth import get_current_user, agent_or_admin_required, field_access_required
from app.utils.responses import success_response, error_response

notes_bp = Blueprint("notes", __name__)


@notes_bp.route("/fields/<int:field_id>/notes", methods=["GET"])
@field_access_required
def get_notes(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)
    notes = [n.to_dict() for n in field.notes]
    return success_response(data=notes)


@notes_bp.route("/fields/<int:field_id>/notes", methods=["POST"])
@field_access_required
def add_note(field_id):
    field = Field.query.filter_by(id=field_id, is_active=True).first()
    if not field:
        return error_response("Field not found", 404)

    data = request.get_json()
    if not data:
        return error_response("Request body required")

    note_text = data.get("note_text", "").strip()
    if not note_text:
        return error_response("Note text is required")
    if len(note_text) > 2000:
        return error_response("Note text must be under 2000 characters")

    user = get_current_user()
    note = FieldNote(
        field_id=field_id,
        author_id=user.id,
        note_text=note_text,
        stage_at_time=field.stage,
    )
    db.session.add(note)
    db.session.commit()

    return success_response(
        data=note.to_dict(),
        message="Note added successfully",
        status_code=201,
    )


@notes_bp.route("/notes/<int:note_id>", methods=["DELETE"])
@agent_or_admin_required
def delete_note(note_id):
    note = FieldNote.query.get(note_id)
    if not note:
        return error_response("Note not found", 404)

    user = get_current_user()
    
    if user.role != "admin" and note.author_id != user.id:
        return error_response("Access denied", 403)

    db.session.delete(note)
    db.session.commit()
    return success_response(message="Note deleted")
