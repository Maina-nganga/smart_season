import { useState } from "react";
import { AlertTriangle, FileText, Edit3, ChevronRight } from "lucide-react";
import { noteService, fieldService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Modal, Button, FormTextarea, FormSelect, StageBadge, StatusBadge,
  ProgressBar, Alert, Divider, Avatar,
} from "@/components/common";
import { STAGES, fmtDate, fmtRelative, extractError, HEADER_COLORS } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function FieldDetailModal({ field: initialField, onClose, onFieldUpdated }) {
  const { user, isAdmin } = useAuth();
  const [field, setField] = useState(initialField);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editingStage, setEditingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(field.stage);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [noteError, setNoteError] = useState("");

  const isAssignedAgent = user?.id === field.agent_id;
  const canEdit = isAdmin || isAssignedAgent;

  const refresh = async () => {
    try {
      const { data } = await fieldService.get(field.id);
      setField(data.data);
      onFieldUpdated?.(data.data);
    } catch { /* ignore */ }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return setNoteError("Note cannot be empty.");
    setNoteError("");
    setAddingNote(true);
    try {
      await noteService.add(field.id, newNote.trim());
      setNewNote("");
      toast.success("Note added!");
      await refresh();
    } catch (err) {
      setNoteError(extractError(err));
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.delete(noteId);
      toast.success("Note deleted");
      await refresh();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleStageUpdate = async () => {
    setUpdatingStage(true);
    try {
      const { data } = await fieldService.updateStage(field.id, selectedStage);
      setField(data.data);
      onFieldUpdated?.(data.data);
      setEditingStage(false);
      toast.success(`Stage updated to ${selectedStage}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setUpdatingStage(false);
    }
  };

  const accentColor = HEADER_COLORS[field.id % HEADER_COLORS.length];

  return (
    <Modal
      title={field.name}
      onClose={onClose}
      maxWidth={580}
      footer={
        <div style={{ display: "flex", width: "100%", gap: 8 }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      {/* Color bar */}
      <div style={{ height: 5, background: accentColor, borderRadius: 4, marginBottom: 18, marginTop: -4 }} />

      {/* Badges row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <StatusBadge status={field.status} />
        <StageBadge stage={field.stage} />
        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, background: "var(--cream-2)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>
          {field.crop_type}
        </span>
        {field.area_hectares && (
          <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, background: "var(--cream-2)", color: "var(--text-secondary)", fontSize: 12 }}>
            {field.area_hectares} ha
          </span>
        )}
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[
          ["Planted", fmtDate(field.planting_date)],
          ["Days Growing", `${field.days_since_planted} days`],
          ["Field Agent", field.agent?.name || "—"],
          ["Last Updated", fmtRelative(field.updated_at)],
          ...(field.location ? [["Location", field.location]] : []),
        ].map(([label, value]) => (
          <div key={label} style={{ background: "var(--cream-2)", borderRadius: "var(--r-sm)", padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Season Progress</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{field.progress}%</span>
        </div>
        <ProgressBar value={field.progress} stage={field.stage} height={8} />
        {/* Stage milestones */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {STAGES.map((s) => {
            const done = STAGES.indexOf(s) <= STAGES.indexOf(field.stage);
            return (
              <div key={s} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", margin: "0 auto 3px", background: done ? "var(--sage-2)" : "var(--mist)", transition: "background 0.3s" }} />
                <div style={{ fontSize: 10, color: done ? "var(--sage-2)" : "var(--text-muted)" }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage update (agents and admins) */}
      {canEdit && (
        <div style={{ marginBottom: 20, background: "var(--cream)", borderRadius: "var(--r-sm)", padding: 14, border: "1px solid var(--mist)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>
            Update Stage
          </div>
          {editingStage ? (
            <div style={{ display: "flex", gap: 8 }}>
              <FormSelect
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormSelect>
              <Button size="sm" onClick={handleStageUpdate} loading={updatingStage}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => { setEditingStage(false); setSelectedStage(field.stage); }}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" icon={<Edit3 size={13} />} onClick={() => setEditingStage(true)}>
              Change Stage
            </Button>
          )}
        </div>
      )}

      <Divider />

      {/* Notes / Observations */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <FileText size={15} color="var(--text-muted)" />
          <h4 style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Observations & Notes
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>
              ({field.notes?.length || 0})
            </span>
          </h4>
        </div>

        {/* Timeline */}
        {field.notes?.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>No observations recorded yet.</p>
        )}
        <div style={{ position: "relative", paddingLeft: 22 }}>
          {field.notes?.length > 0 && (
            <div style={{ position: "absolute", left: 6, top: 4, bottom: 0, width: 2, background: "var(--mist)" }} />
          )}
          {[...(field.notes || [])].reverse().map((note) => {
            const isAuthor = user?.id === note.author_id;
            const canDelete = isAdmin || isAuthor;
            return (
              <div key={note.id} style={{ position: "relative", marginBottom: 14 }}>
                <div style={{
                  position: "absolute", left: -22, top: 5,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "var(--sage)", border: "2px solid var(--white)",
                  boxShadow: "0 0 0 2px var(--mist)",
                }} />
                <div style={{ background: "var(--cream-2)", borderRadius: "var(--r-sm)", padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{note.note_text}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {note.author?.name} · {fmtRelative(note.created_at)}
                      {note.stage_at_time && ` · at ${note.stage_at_time}`}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        style={{ fontSize: 11, color: "var(--danger-text)", background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add note form */}
      {canEdit && (
        <div>
          {noteError && <Alert type="error">{noteError}</Alert>}
          <FormTextarea
            label="Add Observation"
            value={newNote}
            onChange={(e) => { setNewNote(e.target.value); setNoteError(""); }}
            placeholder="Record an observation, measurement, or activity…"
          />
          <Button size="sm" icon={<FileText size={13} />} onClick={handleAddNote} loading={addingNote}>
            Add Note
          </Button>
        </div>
      )}
    </Modal>
  );
}
