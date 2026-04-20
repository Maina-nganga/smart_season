import { Clock, FileText } from "lucide-react";
import { StatusBadge, StageBadge, ProgressBar } from "@/components/common";
import { fmtDate, fmtRelative, HEADER_COLORS } from "@/utils/helpers";

export default function FieldCard({ field, onClick }) {
  const accentColor = HEADER_COLORS[(field.id - 1) % HEADER_COLORS.length];

  return (
    <div
      onClick={() => onClick(field)}
      style={{
        background: "var(--white)",
        borderRadius: "var(--r)",
        border: "1px solid var(--mist)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Color accent bar */}
      <div style={{ height: 6, background: accentColor }} />

      <div style={{ padding: "16px 18px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4, gap: 8 }}>
          <h3 style={{
            fontSize: 15, fontFamily: "'Playfair Display', serif",
            color: "var(--text-primary)", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {field.name}
          </h3>
          <StatusBadge status={field.status} />
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
          {field.crop_type} · Planted {fmtDate(field.planting_date)}
        </p>

        {/* Stage badge + notes count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <StageBadge stage={field.stage} />
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
            <FileText size={12} />
            {field.notes_count || 0} note{(field.notes_count || 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Progress bar */}
        <ProgressBar value={field.progress} stage={field.stage} height={5} />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
            {field.agent?.name || "Unassigned"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", flexShrink: 0, marginLeft: 8 }}>
            <Clock size={11} />
            {fmtRelative(field.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
