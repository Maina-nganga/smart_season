import { useState, useCallback } from "react";
import { fieldService } from "@/services/api";
import toast from "react-hot-toast";

export function useFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFields = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fieldService.list(params);
      setFields(data.data.fields);
      return data.data.fields;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load fields";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createField = useCallback(async (formData) => {
    const { data } = await fieldService.create(formData);
    const newField = data.data;
    setFields((prev) => [newField, ...prev]);
    toast.success("Field created successfully!");
    return newField;
  }, []);

  const updateField = useCallback(async (id, formData) => {
    const { data } = await fieldService.update(id, formData);
    const updated = data.data;
    setFields((prev) => prev.map((f) => (f.id === id ? updated : f)));
    toast.success("Field updated successfully!");
    return updated;
  }, []);

  const updateStage = useCallback(async (id, stage) => {
    const { data } = await fieldService.updateStage(id, stage);
    const updated = data.data;
    setFields((prev) => prev.map((f) => (f.id === id ? updated : f)));
    toast.success(`Stage updated to ${stage}`);
    return updated;
  }, []);

  const deleteField = useCallback(async (id) => {
    await fieldService.delete(id);
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast.success("Field deleted");
  }, []);

  return { fields, loading, error, fetchFields, createField, updateField, updateStage, deleteField };
}
