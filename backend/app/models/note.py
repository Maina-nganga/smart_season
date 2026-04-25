from datetime import datetime, timezone
from app import db


class FieldNote(db.Model):
    __tablename__ = "field_notes"

    id = db.Column(db.Integer, primary_key=True)
    field_id = db.Column(
        db.Integer, db.ForeignKey("fields.id", ondelete="CASCADE"), nullable=False
    )
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    note_text = db.Column(db.Text, nullable=False)
    stage_at_time = db.Column(
        db.Enum("Planted", "Growing", "Ready", "Harvested", name="note_stage"), nullable=True
    )
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

  
    field = db.relationship("Field", back_populates="notes")
    author = db.relationship("User", back_populates="notes")

    def to_dict(self):
        return {
            "id": self.id,
            "field_id": self.field_id,
            "author_id": self.author_id,
            "author": self.author.to_dict() if self.author else None,
            "note_text": self.note_text,
            "stage_at_time": self.stage_at_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<FieldNote field={self.field_id} by={self.author_id}>"
