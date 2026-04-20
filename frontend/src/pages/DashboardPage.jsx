import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AlertTriangle, TrendingUp, Layers, Users, Plus } from "lucide-react";
import { dashboardService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Card, StatusBadge, StageBadge, PageHeader, Button, Spinner, EmptyState, Avatar,
} from "@/components/common";
import { fmtDate, fmtRelative, STAGE_CONFIG } from "@/utils/helpers";


function StatCard({ label, value, sub, accent, icon }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </p>
        {icon && (
          <div style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", color: accent || "var(--sage-2)" }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontFamily: "'Playfair Display', serif", fontWeight: 600, color: accent || "var(--text-primary)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>}
    </Card>
  );
}

const STATUS_COLORS = { Active: "#639922", "At Risk": "#D4A94A", Completed: "#378ADD" };

function StatusDonut({ statuses }) {
  const data = Object.entries(statuses)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
          paddingAngle={3} dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#ccc"} />
          ))}
        </Pie>
        <Tooltip formatter={(v, n) => [`${v} fields`, n]} />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}


function StageBars({ stages, total }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Object.entries(stages).map(([stage, count]) => {
        const cfg = STAGE_CONFIG[stage] || {};
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={stage}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{stage}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: cfg.accent || "var(--text-primary)" }}>{count}</span>
            </div>
            <div style={{ background: "var(--mist)", borderRadius: 20, height: 7, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 20, background: cfg.accent || "var(--sage-2)", width: `${pct}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HealthScore({ score, stats }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--earth-2) 0%, #1E3318 100%)",
      borderRadius: "var(--r)",
      padding: 24, color: "#fff",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -15, right: -15, width: 100, height: 100, borderRadius: "50%", background: "rgba(139,158,122,0.12)" }} />
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>Season Health Score</p>
      <div style={{ fontSize: 46, fontFamily: "'Playfair Display', serif", color: "#fff", lineHeight: 1 }}>
        {score}<span style={{ fontSize: 22, opacity: 0.6 }}>%</span>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>
        {stats?.Active || 0} active · {stats?.Completed || 0} harvested · {stats?.["At Risk"] || 0} at risk
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    (async () => {
      try {
        const fn = isAdmin ? dashboardService.admin : dashboardService.agent;
        const { data } = await fn();
        setStats(data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        console.error("Response:", err.response?.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!stats) return <EmptyState icon="📊" title="Could not load dashboard" subtitle="Please refresh the page." />;

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Overview"
        title={isAdmin ? "Season Dashboard" : "My Fields Dashboard"}
        subtitle={`Season snapshot · ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}`}
        action={isAdmin && (
          <Button icon={<Plus size={15} />} onClick={() => navigate("/fields")}>
            New Field
          </Button>
        )}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Fields" value={stats.total} sub={isAdmin ? "across all agents" : "assigned to you"} icon={<Layers size={16} />} />
        <StatCard label="Active" value={stats.statuses?.Active || 0} sub="performing well" accent="var(--sage-2)" icon={<TrendingUp size={16} />} />
        <StatCard label="At Risk" value={stats.statuses?.["At Risk"] || 0} sub="need attention" accent="var(--amber-2)" icon={<AlertTriangle size={16} />} />
        <StatCard label="Completed" value={stats.statuses?.Completed || 0} sub="harvested" accent="#185FA5" />
        {isAdmin && <StatCard label="Field Agents" value={stats.total_agents || 0} sub="active this season" icon={<Users size={16} />} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Status Overview</h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Field health distribution</p>
          <StatusDonut statuses={stats.statuses || {}} />
        </Card>
        <Card>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Stage Breakdown</h3>
          <StageBars stages={stats.stages || {}} total={stats.total} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <Card padding={0}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--mist)" }}>
            <h3 style={{ fontSize: 15 }}>Recent Activity</h3>
          </div>
          {(!stats.recent_activity || stats.recent_activity.length === 0) ? (
            <EmptyState title="No recent activity" />
          ) : stats.recent_activity.map((f) => (
            <div
              key={f.id}
              style={{ display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid var(--cream-2)", cursor: "pointer", transition: "background 0.15s" }}
              onClick={() => navigate("/fields")}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 12 }}>
                🌱
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  {f.agent?.name} · {fmtRelative(f.updated_at)}
                </div>
              </div>
              <StatusBadge status={f.status} />
            </div>
          ))}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {stats.at_risk_fields?.length > 0 && (
            <Card style={{ border: "1px solid var(--warning-border)", background: "var(--warning-bg)" }} padding={0}>
              <div style={{ padding: "16px 20px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <AlertTriangle size={15} color="var(--warning-text)" />
                  <h3 style={{ fontSize: 14, color: "var(--warning-text)" }}>Needs Attention</h3>
                </div>
                {stats.at_risk_fields.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(212,169,74,0.2)", cursor: "pointer" }}
                    onClick={() => navigate("/fields")}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--warning-text)" }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.crop_type}</div>
                    </div>
                    <StageBadge stage={f.stage} />
                  </div>
                ))}
              </div>
            </Card>
          )}
          <HealthScore score={stats.health_score || 0} stats={stats.statuses} />
          {isAdmin && stats.agent_summaries?.length > 0 && (
            <Card padding={0}>
              <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--mist)" }}>
                <h3 style={{ fontSize: 14 }}>Agent Load</h3>
              </div>
              {stats.agent_summaries.map(({ agent, stats: as }) => (
                <div key={agent.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--cream-2)" }}>
                  <Avatar name={agent.name} role="agent" size={28} />
                  <div style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{as.total} fields</div>
                  {as.statuses?.["At Risk"] > 0 && (
                    <div style={{ marginLeft: 8, width: 7, height: 7, borderRadius: "50%", background: "var(--amber-2)" }} />
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}