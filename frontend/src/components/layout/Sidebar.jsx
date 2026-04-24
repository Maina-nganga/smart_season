import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Users, LogOut, Sprout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/common";

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { to: "/fields",    icon: <Map size={17} />,             label: "Fields" },
    ...(isAdmin ? [{ to: "/agents", icon: <Users size={17} />, label: "Field Agents" }] : []),
  ];

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      background: "var(--earth-2)",
      color: "var(--cream)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0, left: 0,
      height: "100vh",
      zIndex: 100,
      overflowY: "auto",
    }}>
     
      <div style={{ padding: "28px 22px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "var(--sage-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            
          </div>
          <div>
            <div style={{ fontSize: 15, fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "var(--cream)" }}>
              SmartSeason
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              Field Monitoring
            </div>
          </div>
        </div>
      </div>

    
      <nav style={{ padding: "16px 0", flex: 1 }}>
        <p style={{
          fontSize: 10, letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.3)",
          padding: "0 20px 10px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}>
          Main Menu
        </p>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 20px",
              color: isActive ? "var(--cream)" : "rgba(255,255,255,0.58)",
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              textDecoration: "none",
              borderLeft: `3px solid ${isActive ? "var(--sage)" : "transparent"}`,
              background: isActive ? "rgba(139,158,122,0.18)" : "transparent",
              transition: "all 0.18s",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              }
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.getAttribute("aria-current") === "page";
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.58)";
              }
            }}
          >
            <span style={{ opacity: 0.85, flexShrink: 0 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

    
      <div style={{ padding: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.07)",
          borderRadius: 10,
        }}>
          <Avatar name={user?.name} role={user?.role} size={33} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
              {user?.role === "admin" ? "Administrator" : "Field Agent"}
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={{
              color: "rgba(255,255,255,0.38)", padding: 6,
              borderRadius: 6, transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
