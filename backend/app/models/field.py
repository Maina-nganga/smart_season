from datetime import datetime, timezone, date
from app import db


RISK_KEYWORDS = [
    "drought", "stress", "infestation", "pest", "disease",
    "wilting", "stunted", "fungal", "irrigation requested",
    "yellowing", "rot", "blight", "flood", "waterlog",
    "nutrient deficiency", "aphid", "locust", "mold",
]

STAGES = ["Planted", "Growing", "Ready", "Harvested"]
STAGE_PROGRESS = {"Planted": 25, "Growing": 55, "Ready": 80, "Harvested": 100}


class Field(db.Model):
    __tablename__ = "fields"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    crop_type = db.Column(db.String(80), nullable=False)
    planting_date = db.Column(db.Date, nullable=False)
    stage = db.Column(
        db.Enum("Planted", "Growing", "Ready", "Harvested"),
        nullable=False,
        default="Planted",
    )
    location = db.Column(db.String(200), nullable=True)
    area_hectares = db.Column(db.Numeric(8, 2), nullable=True)
    agent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

 
    agent = db.relationship("User", back_populates="assigned_fields", foreign_keys=[agent_id])
    notes = db.relationship(
        "FieldNote", back_populates="field", cascade="all, delete-orphan",
        order_by="FieldNote.created_at.asc()"
    )

    @property
    def days_since_planted(self):
        today = date.today()
        return (today - self.planting_date).days

    @property
    def days_since_updated(self):
        if not self.updated_at:
            return 999
        today = datetime.now(timezone.utc)
        delta = today - self.updated_at.replace(tzinfo=timezone.utc)
        return delta.days

    @property
    def status(self):
        """
        Status logic:
        - Completed: stage is Harvested
        - At Risk: any note contains risk keywords,
                   OR Growing/Planted with no update in 14+ days,
                   OR Ready stage planted 180+ days ago
        - Active: everything else
        """
        if self.stage == "Harvested":
            return "Completed"

       
        for note in self.notes:
            note_text = note.note_text.lower()
            if any(kw in note_text for kw in RISK_KEYWORDS):
                return "At Risk"

      
        if self.stage in ("Growing", "Planted") and self.days_since_updated > 14:
            return "At Risk"

        if self.stage == "Ready" and self.days_since_planted > 180:
            return "At Risk"

        return "Active"

    @property
    def progress(self):
        return STAGE_PROGRESS.get(self.stage, 0)

    def to_dict(self, include_notes=False):
        data = {
            "id": self.id,
            "name": self.name,
            "crop_type": self.crop_type,
            "planting_date": self.planting_date.isoformat() if self.planting_date else None,
            "stage": self.stage,
            "location": self.location,
            "area_hectares": float(self.area_hectares) if self.area_hectares else None,
            "agent_id": self.agent_id,
            "agent": self.agent.to_dict() if self.agent else None,
            "status": self.status,
            "progress": self.progress,
            "days_since_planted": self.days_since_planted,
            "days_since_updated": self.days_since_updated,
            "notes_count": len(self.notes),
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_notes:
            data["notes"] = [n.to_dict() for n in self.notes]
        return data

    def __repr__(self):
        return f"<Field {self.name} ({self.stage})>"
