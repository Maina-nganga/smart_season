import { useState, useEffect } from "react";
import { userService } from "@/services/api";
import {
  Modal, Button, FormInput, FormSelect, Alert,
} from "@/components/common";
import { STAGES, CROP_TYPES, extractError } from "@/utils/helpers";

export default function FieldFormModal({ field, onSave, onClose }) {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: field?.name || "",
    crop_type: field?.crop_type || "Maize",
    planting_date: field?.planting_date || "",
    stage: field?.stage || "Planted",
    agent_id: field?.agent_id || "",
    location: field?.location || "",
    area_hectares: field?.area_hectares || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService.agents().then(({ data }) => setAgents(data.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Field name is required.");
    if (!form.planting_date) return setError("Planting date is required.");
    if (!form.agent_id) return setError("Please assign a field agent.");
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        agent_id: Number(form.agent_id),
        area_hectares: form.area_hectares ? Number(form.area_hectares) : null,
      });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={field ? "Edit Field" : "Add New Field"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            {field ? "Save Changes" : "Create Field"}
          </Button>
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormInput label="Field Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Kibera North Plot" required />
        </div>

        <FormSelect label="Crop Type" value={form.crop_type} onChange={(e) => set("crop_type", e.target.value)} required>
          {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
        </FormSelect>

        <FormInput label="Planting Date" type="date" value={form.planting_date} onChange={(e) => set("planting_date", e.target.value)} required />

        <FormSelect label="Current Stage" value={form.stage} onChange={(e) => set("stage", e.target.value)}>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </FormSelect>

        <FormSelect label="Assign Field Agent" value={form.agent_id} onChange={(e) => set("agent_id", e.target.value)} required>
          <option value="">— Select agent —</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </FormSelect>

        <div style={{ gridColumn: "1 / -1" }}>
          <FormInput label="Location / GPS Reference" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Kibera, Nairobi (-1.3133, 36.7856)" />
        </div>

        <FormInput label="Area (Hectares)" type="number" value={form.area_hectares} onChange={(e) => set("area_hectares", e.target.value)} placeholder="e.g. 2.5" />
      </div>
    </Modal>
  );
}
