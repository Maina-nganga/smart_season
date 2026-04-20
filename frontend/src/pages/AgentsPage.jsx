import { useEffect, useState } from "react";
import { Plus, Mail, Leaf } from "lucide-react";
import { userService } from "@/services/api";
import { fieldService } from "@/services/api";
import {
  PageHeader, Card, Button, Avatar, StatusBadge, StageBadge,
  Spinner, EmptyState, Modal, FormInput, FormSelect, Alert, ConfirmDialog,
} from "@/components/common";
import { extractError } from "@/utils/helpers";
import toast from "react-hot-toast";

/* ── Agent card ─────────────────────────────────────────── */
function AgentCard({ agent, fields, onEdit, onDeactivate }) {
  const [expanded, setExpanded] = useState(false);
  const agentFields = fields.filter((f) => f.agent_id === agent.id);
  const active    = agentFields.filter((f) => f.status === "Active").length;
  const atRisk    = agentFields.filter((f) => f.status === "At Risk").length;
  const completed = agentFields.filter((f) => f.status === "Completed").length;

  return (
    <Card style={{ overflow: "hidden" }} padding={0}>
      {/* Header */}
      <div style={{ padding: "20px 22px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <Avatar name={agent.name} role="agent" size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16 }}>{agent.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              <Mail size={12} />
              {agent.email}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button size="sm" variant="secondary" onClick={() => onEdit(agent)}>Edit</Button>
            <Button size="sm" variant="danger"    onClick={() => onDeactivate(agent)}>Remove</Button>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Active",    count: active,    bg: "var(--success-bg)", color: "var(--success-text)" },
            { label: "At Risk",   count: atRisk,    bg: "var(--warning-bg)", color: "var(--warning-text)" },
            { label: "Completed", count: completed, bg: "var(--info-bg)",    color: "var(--info-text)" },
          ].map(({ label, count, bg, color }) => (
            <div key={label} style={{ textAlign: "center", background: bg, borderRadius: "var(--r-sm)", padding: "10px 6px" }}>
              <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 600, color }}>{count}</div>
              <div style={{ fontSize: 10, color, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {agentFields.length} field{agentFields.length !== 1 ? "s" : ""} assigned
        </p>
      </div>

      {/* Field list */}
      {agentFields.length > 0 && (
        <div style={{ borderTop: "1px solid var(--mist)" }}>
          {(expanded ? agentFields : agentFields.slice(0, 3)).map((f) => (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 22px", borderBottom: "1px solid var(--cream-2)",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.crop_type}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StageBadge stage={f.stage} />
                <StatusBadge status={f.status} />
              </div>
            </div>
          ))}
          {agentFields.length > 3 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{
                display: "block", width: "100%", padding: "10px 22px",
                fontSize: 13, color: "var(--sage-2)", textAlign: "center",
                background: "none", border: "none", cursor: "pointer",
                borderTop: "1px solid var(--cream-2)",
              }}
            >
              {expanded ? "Show less" : `+${agentFields.length - 3} more fields`}
            </button>
          )}
        </div>
      )}
      {agentFields.length === 0 && (
        <div style={{ borderTop: "1px solid var(--mist)", padding: "14px 22px" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <Leaf size={13} /> No fields assigned yet
          </p>
        </div>
      )}
    </Card>
  );
}

/* ── Agent form modal ───────────────────────────────────── */
function AgentFormModal({ agent, onSave, onClose }) {
  const [form, setForm] = useState({
    name: agent?.name || "",
    email: agent?.email || "",
    password: "",
    role: "agent",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!agent && form.password.length < 6) return setError("Password must be at least 6 characters.");
    setError(""); setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={agent ? "Edit Agent" : "Add Field Agent"}
      onClose={onClose}
      maxWidth={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{agent ? "Save Changes" : "Create Agent"}</Button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}
      <FormInput label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. James Ochieng" required />
      <FormInput label="Email Address" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="james@example.com" required />
      <FormInput
        label={agent ? "New Password (leave blank to keep current)" : "Password"}
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        placeholder="••••••••"
        required={!agent}
        hint="Minimum 6 characters"
      />
      <FormSelect label="Role" value={form.role} onChange={(e) => set("role", e.target.value)}>
        <option value="agent">Field Agent</option>
        <option value="admin">Administrator</option>
      </FormSelect>
    </Modal>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export default function AgentsPage() {
  const [agents, setAgents]     = useState([]);
  const [fields, setFields]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setCreate] = useState(false);
  const [editAgent, setEdit]    = useState(null);
  const [deactivate, setDeact]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ua, fa] = await Promise.all([
        userService.list({ role: "agent" }),
        fieldService.list({ per_page: 200 }),
      ]);
      setAgents(ua.data.data);
      setFields(fa.data.data.fields);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    await userService.create({ ...form, role: "agent" });
    toast.success("Agent created!");
    setCreate(false);
    load();
  };

  const handleEdit = async (form) => {
    const payload = { name: form.name, email: form.email };
    if (form.password) payload.password = form.password;
    await userService.update(editAgent.id, payload);
    toast.success("Agent updated!");
    setEdit(null);
    load();
  };

  const handleDeactivate = async () => {
    await userService.delete(deactivate.id);
    toast.success("Agent deactivated");
    setDeact(null);
    load();
  };

  return (
    <div className="fade-in">
      <PageHeader
        eyebrow="Team"
        title="Field Agents"
        subtitle={`${agents.length} agent${agents.length !== 1 ? "s" : ""} active this season`}
        action={
          <Button icon={<Plus size={15} />} onClick={() => setCreate(true)}>
            Add Agent
          </Button>
        }
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : agents.length === 0 ? (
        <Card><EmptyState icon="👤" title="No agents yet" subtitle="Add your first field agent to get started." /></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {agents.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              fields={fields}
              onEdit={setEdit}
              onDeactivate={setDeact}
            />
          ))}
        </div>
      )}

      {showCreate && <AgentFormModal onSave={handleCreate} onClose={() => setCreate(false)} />}
      {editAgent  && <AgentFormModal agent={editAgent} onSave={handleEdit} onClose={() => setEdit(null)} />}
      {deactivate && (
        <ConfirmDialog
          title="Deactivate Agent"
          message={`Remove ${deactivate.name} from the system? Their fields will remain but they will no longer be able to log in.`}
          onConfirm={handleDeactivate}
          onCancel={() => setDeact(null)}
        />
      )}
    </div>
  );
}
