import { forwardRef, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { STATUS_CONFIG, STAGE_CONFIG, cx } from "@/utils/helpers";


const VARIANTS = {
  primary:   { bg: "var(--sage-2)",      color: "#fff",                border: "var(--sage-2)",   hover: "var(--sage-3)" },
  secondary: { bg: "var(--white)",       color: "var(--text-primary)", border: "var(--mist)",     hover: "var(--cream-2)" },
  danger:    { bg: "var(--danger-bg)",   color: "var(--danger-text)",  border: "rgba(139,32,32,0.25)", hover: "#F5D5D5" },
  ghost:     { bg: "transparent",        color: "var(--text-secondary)",border: "transparent",    hover: "var(--cream-2)" },
  terra:     { bg: "var(--terracotta)",  color: "#fff",                border: "var(--terracotta)", hover: "var(--terra-2)" },
};

export function Button({
  children, variant = "primary", size = "md", loading = false,
  icon, iconRight, className, style, disabled, onClick, type = "button", ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const padding = { sm: "6px 14px", md: "10px 20px", lg: "13px 28px" }[size];
  const fontSize = { sm: "13px", md: "14px", lg: "15px" }[size];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding, fontSize, fontWeight: 500, borderRadius: "var(--r-sm)",
        border: `1px solid ${v.border}`,
        background: v.bg, color: v.color,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "background 0.18s, transform 0.1s",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={(e) => { if (!disabled && !loading) e.currentTarget.style.background = v.bg; }}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      className={className}
      {...props}
    >
      {loading ? <Spinner size={14} color={v.color} /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}


export function Spinner({ size = 20, color = "var(--sage-2)" }) {
  return (
    <div
      style={{
        width: size, height: size,
        border: `2px solid rgba(0,0,0,0.1)`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}


export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Active;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

export function StageBadge({ stage }) {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG.Planted;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      {stage}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      background: isAdmin ? "rgba(196,112,74,0.12)" : "rgba(107,130,87,0.12)",
      color: isAdmin ? "var(--terra-2)" : "var(--sage-2)",
      fontSize: 12, fontWeight: 500,
    }}>
      {isAdmin ? "Admin" : "Field Agent"}
    </span>
  );
}


export function Card({ children, style, className, onClick, padding = "24px" }) {
  return (
    <div
      className={cx("fade-in", className)}
      onClick={onClick}
      style={{
        background: "var(--white)",
        borderRadius: "var(--r)",
        border: "1px solid var(--mist)",
        boxShadow: "var(--shadow-sm)",
        padding,
        cursor: onClick ? "pointer" : undefined,
        transition: onClick ? "box-shadow 0.2s" : undefined,
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      {children}
    </div>
  );
}


export function Modal({ title, onClose, children, footer, maxWidth = 540 }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(44,31,14,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, backdropFilter: "blur(3px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="fade-in"
        style={{
          background: "var(--white)", borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          width: "100%", maxWidth, maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
    
        <div style={{
          padding: "22px 28px 18px",
          borderBottom: "1px solid var(--mist)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, display: "flex", alignItems: "center",
              justifyContent: "center", borderRadius: "var(--r-sm)",
              color: "var(--text-muted)", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream-2)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <X size={16} />
          </button>
        </div>
       
        <div style={{ padding: "22px 28px", overflowY: "auto", flex: 1 }}>{children}</div>
      
        {footer && (
          <div style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--mist)",
            display: "flex", gap: 10, justifyContent: "flex-end",
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


export const FormInput = forwardRef(function FormInput(
  { label, error, type = "text", hint, required, ...props }, ref
) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
          {label} {required && <span style={{ color: "var(--terracotta)" }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          type={isPassword && showPwd ? "text" : type}
          {...props}
          style={{
            width: "100%",
            padding: isPassword ? "10px 40px 10px 14px" : "10px 14px",
            border: `1px solid ${error ? "var(--terracotta)" : "var(--mist)"}`,
            borderRadius: "var(--r-sm)",
            fontSize: 14, color: "var(--text-primary)",
            background: "var(--white)",
            transition: "border-color 0.2s",
            ...props.style,
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--sage-2)"; e.target.style.boxShadow = "0 0 0 3px rgba(107,130,87,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = error ? "var(--terracotta)" : "var(--mist)"; e.target.style.boxShadow = "none"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--terracotta)", marginTop: 4 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
});

export function FormSelect({ label, error, required, children, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
          {label} {required && <span style={{ color: "var(--terracotta)" }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={{
          width: "100%", padding: "10px 14px",
          border: `1px solid ${error ? "var(--terracotta)" : "var(--mist)"}`,
          borderRadius: "var(--r-sm)",
          fontSize: 14, color: "var(--text-primary)",
          background: "var(--white)", appearance: "auto",
          ...props.style,
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--sage-2)"; e.target.style.boxShadow = "0 0 0 3px rgba(107,130,87,0.12)"; }}
        onBlur={(e) => { e.target.style.borderColor = error ? "var(--terracotta)" : "var(--mist)"; e.target.style.boxShadow = "none"; }}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: 12, color: "var(--terracotta)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export function FormTextarea({ label, error, required, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
          {label} {required && <span style={{ color: "var(--terracotta)" }}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        style={{
          width: "100%", padding: "10px 14px",
          border: `1px solid ${error ? "var(--terracotta)" : "var(--mist)"}`,
          borderRadius: "var(--r-sm)",
          fontSize: 14, color: "var(--text-primary)",
          background: "var(--white)", resize: "vertical",
          minHeight: 90, fontFamily: "inherit",
          ...props.style,
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--sage-2)"; e.target.style.boxShadow = "0 0 0 3px rgba(107,130,87,0.12)"; }}
        onBlur={(e) => { e.target.style.borderColor = error ? "var(--terracotta)" : "var(--mist)"; e.target.style.boxShadow = "none"; }}
      />
      {error && <p style={{ fontSize: 12, color: "var(--terracotta)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}


export function Alert({ type = "error", children }) {
  const styles = {
    error:   { bg: "var(--danger-bg)",  color: "var(--danger-text)",  border: "var(--danger-border)" },
    success: { bg: "var(--success-bg)", color: "var(--success-text)", border: "var(--success-border)" },
    warning: { bg: "var(--warning-bg)", color: "var(--warning-text)", border: "var(--warning-border)" },
    info:    { bg: "var(--info-bg)",    color: "var(--info-text)",    border: "var(--info-border)" },
  };
  const s = styles[type] || styles.error;
  return (
    <div style={{
      padding: "11px 16px", borderRadius: "var(--r-sm)",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 13, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}


export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>{icon || "🌾"}</div>
      <h3 style={{ fontSize: 16, marginBottom: 6, color: "var(--text-secondary)" }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{subtitle}</p>}
      {action}
    </div>
  );
}


export function Avatar({ name = "", role = "agent", size = 36 }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = role === "admin" ? "var(--terracotta)" : "var(--sage-2)";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}


export function ProgressBar({ value = 0, stage = "Growing", height = 6 }) {
  const colors = { Planted: "var(--earth)", Growing: "var(--sage-2)", Ready: "var(--amber-2)", Harvested: "#378ADD" };
  return (
    <div style={{ background: "var(--mist)", borderRadius: 20, height, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 20,
        background: colors[stage] || "var(--sage-2)",
        width: `${value}%`,
        transition: "width 0.4s ease",
      }} />
    </div>
  );
}


export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
      <div>
        {eyebrow && (
          <p style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
            {eyebrow}
          </p>
        )}
        <h2 style={{ fontSize: 24 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}


export function Divider({ style }) {
  return <div style={{ height: 1, background: "var(--mist)", margin: "20px 0", ...style }} />;
}

export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <svg
        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px 10px 36px",
          border: "1px solid var(--mist)", borderRadius: "var(--r-sm)",
          fontSize: 14, color: "var(--text-primary)", background: "var(--white)",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--sage-2)"; e.target.style.boxShadow = "0 0 0 3px rgba(107,130,87,0.12)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--mist)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}


export function FilterTabs({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = opt === value || opt.value === value;
        const label = opt.label || opt;
        const val = opt.value || opt;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: `1px solid ${active ? "var(--sage-2)" : "var(--mist)"}`,
              background: active ? "var(--sage-2)" : "var(--white)",
              color: active ? "#fff" : "var(--text-secondary)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}


export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth={400}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{message}</p>
    </Modal>
  );
}
