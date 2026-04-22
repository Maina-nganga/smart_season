from datetime import datetime, timezone
from app import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("admin", "agent"), nullable=False, default="agent")
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

   
    assigned_fields = db.relationship(
        "Field", back_populates="agent", foreign_keys="Field.agent_id"
    )
    notes = db.relationship("FieldNote", back_populates="author")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    @property
    def avatar(self):
        parts = self.name.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return self.name[:2].upper()

    def to_dict(self, include_fields=False):
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "avatar": self.avatar,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_fields:
            data["assigned_fields"] = [f.to_dict() for f in self.assigned_fields]
        return data

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
