import os
from app import create_app, db
from app.models.user import User
from app.models.field import Field
from app.models.note import FieldNote

app = create_app(os.environ.get("FLASK_ENV", "development"))


@app.shell_context_processor
def make_shell_context():
    return {"db": db, "User": User, "Field": Field, "FieldNote": FieldNote}


@app.cli.command("seed")
def seed_db():
    """Seed the database with demo data."""
    from datetime import date, datetime, timezone

    print("Seeding database...")

    # Create users
    admin = User(name="Sarah Kimani", email="admin@smartseason.com", role="admin")
    admin.set_password("admin123")

    agent1 = User(name="James Ochieng", email="james@smartseason.com", role="agent")
    agent1.set_password("agent123")

    agent2 = User(name="Amina Wanjiru", email="amina@smartseason.com", role="agent")
    agent2.set_password("agent123")

    agent3 = User(name="Peter Mwangi", email="peter@smartseason.com", role="agent")
    agent3.set_password("agent123")

    db.session.add_all([admin, agent1, agent2, agent3])
    db.session.flush()

    
    fields_data = [
        Field(name="Kibera North Plot", crop_type="Maize",
              planting_date=date(2024, 11, 5), stage="Growing", agent_id=agent1.id, created_by=admin.id),
        Field(name="Westlands Block A", crop_type="Wheat",
              planting_date=date(2024, 10, 12), stage="Ready", agent_id=agent1.id, created_by=admin.id),
        Field(name="Karen Ridge East", crop_type="Tomatoes",
              planting_date=date(2024, 9, 18), stage="Harvested", agent_id=agent1.id, created_by=admin.id),
        Field(name="Langata Field 7", crop_type="Beans",
              planting_date=date(2024, 11, 15), stage="Planted", agent_id=agent2.id, created_by=admin.id),
        Field(name="Ruiru Green Zone", crop_type="Kale",
              planting_date=date(2024, 10, 30), stage="Growing", agent_id=agent2.id, created_by=admin.id),
        Field(name="Thika Main Block", crop_type="Sorghum",
              planting_date=date(2024, 8, 10), stage="Growing", agent_id=agent3.id, created_by=admin.id),
    ]
    db.session.add_all(fields_data)
    db.session.flush()

   
    notes_data = [
        FieldNote(field_id=fields_data[0].id, author_id=agent1.id,
                  note_text="Germination rate excellent, 95% coverage.", stage_at_time="Growing"),
        FieldNote(field_id=fields_data[0].id, author_id=agent1.id,
                  note_text="Applied nitrogen fertilizer at 3-week mark.", stage_at_time="Growing"),
        FieldNote(field_id=fields_data[1].id, author_id=agent1.id,
                  note_text="Grain heads fully formed. Ready for harvest within 2 weeks.", stage_at_time="Ready"),
        FieldNote(field_id=fields_data[2].id, author_id=agent1.id,
                  note_text="Harvest complete. Yield: 4.2 tonnes. Excellent season.", stage_at_time="Harvested"),
        FieldNote(field_id=fields_data[4].id, author_id=agent2.id,
                  note_text="Signs of aphid infestation on eastern edge. Sprayed organic pesticide.", stage_at_time="Growing"),
        FieldNote(field_id=fields_data[5].id, author_id=agent3.id,
                  note_text="Drought stress visible. Irrigation requested.", stage_at_time="Growing"),
        FieldNote(field_id=fields_data[5].id, author_id=agent3.id,
                  note_text="Irrigation system installed. Recovery progress monitored.", stage_at_time="Growing"),
    ]
    db.session.add_all(notes_data)
    db.session.commit()
    print("✓ Database seeded successfully!")
    print("\nDemo credentials:")
    print("  Admin:  admin@smartseason.com / admin123")
    print("  Agent:  james@smartseason.com / agent123")
    print("  Agent:  amina@smartseason.com / agent123")
    print("  Agent:  peter@smartseason.com / agent123")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
