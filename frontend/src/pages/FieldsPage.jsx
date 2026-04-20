import { useEffect, useState, useCallback } from "react";
import { Plus, LayoutGrid, List, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFields } from "@/hooks/useFields";
import {
  PageHeader, Button, SearchBar, FilterTabs, EmptyState,
  Spinner, ConfirmDialog, Card,
} from "@/components/common";
import { StatusBadge, StageBadge } from "@/components/common";
import FieldCard from "@/components/fields/FieldCard";
import FieldDetailModal from "@/components/fields/FieldDetailModal";
import FieldFormModal from "@/components/fields/FieldFormModal";
import { STAGES, fmtDate, fmtRelative } from "@/utils/helpers";
import toast from "react-hot-toast";
import { extractError } from "@/utils/helpers";

const STATUS_FILTERS = ["All", "Active", "At Risk", "Completed"];
const STAGE_FILTERS  = ["All", ...STAGES];

export default function FieldsPage() {
  const { isAdmin } = useAuth();
  const { fields, loading, fetchFields, createField, updateField, deleteField } = useFields();

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("All");
  const [stageFilter, setStage]       = useState("All");
  const [viewMode, setViewMode]       = useState("grid"); // grid | list
  const [selectedField, setSelected]  = useState(null);
  const [editField, setEditField]     = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  // Client-side filter
  const filtered = fields.filter((f) => {
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.crop_type.toLowerCase().includes(search.toLowerCase()) ||
      f.agent?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    const matchStage  = stageFilter  === "All" || f.stage  === stageFilter;
    return matchSearch && matchStatus && matchStage;
  });

  const handleCreate = async (formData) => {
    await createField(formData);
    setShowCreate(false);
  };

  const handleEdit = async (formData) => {
    await updateField(editField.id, formData);
    setEditField(null);
    if (selectedField?.id === editField.id) setSelected(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteField(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedField?.id === deleteTarget.id) setSelected(null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleFieldUpdated = useCallback((updated) => {
    // Refresh list
    fetchFields();
  }, [fetchFields]);

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Management"
        title={isAdmin ? "All Fields" : "My Assigned Fields"}
        subtitle={`${filtered.length} of ${fields.length} field${fields.length !== 1 ? "s" : ""} shown`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={fetchFields}
              title="Refresh"
            />
            {isAdmin && (
              <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
                New Field
              </Button>
            )}
          </div>
        }
      />

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search fields, crops, agents…" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FilterTabs options={STATUS_FILTERS} value={statusFilter} onChange={setStatus} />
          <FilterTabs options={STAGE_FILTERS}  value={stageFilter}  onChange={setStage} />
        </div>
        {/* View toggle */}
        <div style={{ display: "flex", gap: 2, background: "var(--mist)", borderRadius: "var(--r-sm)", padding: 3, flexShrink: 0 }}>
          {[["grid", <LayoutGrid size={15} />], ["list", <List size={15} />]].map(([mode, icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6,
                background: viewMode === mode ? "var(--white)" : "transparent",
                color: viewMode === mode ? "var(--sage-2)" : "var(--text-muted)",
                boxShadow: viewMode === mode ? "var(--shadow-xs)" : "none",
                transition: "all 0.15s",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="🌾"
            title="No fields found"
            subtitle={
              fields.length === 0
                ? isAdmin ? "Create your first field to get started." : "No fields have been assigned to you yet."
                : "Try adjusting your filters or search."
            }
            action={
              isAdmin && fields.length === 0
                ? <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>Create First Field</Button>
                : null
            }
          />
        </Card>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {filtered.map((f) => (
            <FieldCard key={f.id} field={f} onClick={setSelected} />
          ))}
        </div>
      ) : (
        <FieldListView
          fields={filtered}
          isAdmin={isAdmin}
          onView={setSelected}
          onEdit={setEditField}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Field detail */}
      {selectedField && (
        <FieldDetailModal
          field={selectedField}
          onClose={() => setSelected(null)}
          onFieldUpdated={(updated) => {
            setSelected(updated);
            handleFieldUpdated(updated);
          }}
        />
      )}

      {/* Create / Edit modal */}
      {showCreate && (
        <FieldFormModal onSave={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editField && (
        <FieldFormModal field={editField} onSave={handleEdit} onClose={() => setEditField(null)} />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Field"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ── List view ─────────────────────────────────────────── */
function FieldListView({ fields, isAdmin, onView, onEdit, onDelete }) {
  return (
    <Card padding={0}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Field", "Crop", "Planted", "Stage", "Status", "Agent", "Updated", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    color: "var(--text-muted)", padding: "12px 16px",
                    borderBottom: "1px solid var(--mist)", whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr
                key={f.id}
                onClick={() => onView(f)}
                style={{ cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{f.name}</div>
                  {f.location && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.location}</div>}
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)", fontSize: 13 }}>{f.crop_type}</td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)", fontSize: 13 }}>{fmtDate(f.planting_date)}</td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)" }}><StageBadge stage={f.stage} /></td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)" }}><StatusBadge status={f.status} /></td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)", fontSize: 13 }}>{f.agent?.name || "—"}</td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtRelative(f.updated_at)}</td>
                <td
                  style={{ padding: "13px 16px", borderBottom: "1px solid var(--cream-2)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(f); }}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(f); }}>Delete</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
