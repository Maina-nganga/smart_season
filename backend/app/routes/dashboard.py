from flask import Blueprint
from app.models.field import Field
from app.models.user import User
from app.utils.auth import get_current_user, admin_required, agent_or_admin_required
from app.utils.responses import success_response

dashboard_bp = Blueprint("dashboard", __name__)


def compute_stats(fields):
    """Compute dashboard stats from a list of field dicts."""
    total = len(fields)
    statuses = {"Active": 0, "At Risk": 0, "Completed": 0}
    stages = {"Planted": 0, "Growing": 0, "Ready": 0, "Harvested": 0}

    for f in fields:
        status = f.get("status", "Active")
        if status in statuses:
            statuses[status] += 1
        stage = f.get("stage", "Planted")
        if stage in stages:
            stages[stage] += 1

    health_score = (
        round(((statuses["Active"] + statuses["Completed"]) / total) * 100)
        if total > 0
        else 0
    )

    recent = sorted(fields, key=lambda x: x.get("updated_at") or "", reverse=True)[:5]

    at_risk_fields = [f for f in fields if f.get("status") == "At Risk"]

    return {
        "total": total,
        "statuses": statuses,
        "stages": stages,
        "health_score": health_score,
        "recent_activity": recent,
        "at_risk_fields": at_risk_fields,
    }


@dashboard_bp.route("/admin", methods=["GET"])
@admin_required
def admin_dashboard():
    all_fields = Field.query.filter_by(is_active=True).all()
    fields_data = [f.to_dict(include_notes=True) for f in all_fields]

    stats = compute_stats(fields_data)


    agents = User.query.filter_by(role="agent", is_active=True).order_by(User.name).all()
    agent_summaries = []
    for agent in agents:
        agent_fields = [f for f in fields_data if f["agent_id"] == agent.id]
        agent_stats = compute_stats(agent_fields)
        agent_summaries.append({
            "agent": agent.to_dict(),
            "stats": agent_stats,
        })

    stats["agent_summaries"] = agent_summaries
    stats["total_agents"] = len(agents)

    return success_response(data=stats)


@dashboard_bp.route("/agent", methods=["GET"])
@agent_or_admin_required
def agent_dashboard():
    user = get_current_user()
    if user.role == "admin":
        return admin_dashboard()

    my_fields = Field.query.filter_by(agent_id=user.id, is_active=True).all()
    fields_data = [f.to_dict(include_notes=True) for f in my_fields]
    stats = compute_stats(fields_data)

    return success_response(data=stats)
