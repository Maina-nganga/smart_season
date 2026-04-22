import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/common";

const PAGE_LABELS = {
  "/dashboard": "Dashboard",
  "/fields":    "Fields",
  "/agents":    "Field Agents",
  "/profile":   "My Profile",
};

export default function TopBar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const label = PAGE_LABELS[pathname] || "SmartSeason";
  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      height: "var(--topbar-h)",
      background: "var(--white)",
      borderBottom: "1px solid var(--mist)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      boxShadow: "var(--shadow-xs)",
    }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.3 }}>
          {today}
        </div>
        <h2 style={{ fontSize: 18, marginTop: 1 }}>{label}</h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      
        <div style={{
          padding: "5px 12px", borderRadius: 20,
          background: "var(--success-bg)",
          color: "var(--success-text)",
          fontSize: 12, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success-text)", display: "inline-block" }} />
          Season 2024/25
        </div>

      
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={user?.name} role={user?.role} size={34} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {user?.role === "admin" ? "Administrator" : "Field Agent"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
