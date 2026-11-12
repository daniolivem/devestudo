import { useState } from "react";
import Button from "../ui/Button";
import { GROUP_AVAILABILITIES, GROUP_LEVELS } from "../../services/groupService";

export default function GroupFormModal({ group = {}, title, subtitle, onClose, onSubmit, error = "", loading = false }) {
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      technology: String(formData.get("technology") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      availability: String(formData.get("availability") || "").trim(),
      materialsUrl: String(formData.get("materialsUrl") || "").trim(),
    };

    if (!payload.name) {
      setLocalError("Informe o nome do grupo.");
      return;
    }

    if (payload.name.length < 3) {
      setLocalError("O nome do grupo deve ter pelo menos 3 caracteres.");
      return;
    }

    if (payload.technology.length > 50) {
      setLocalError("A tecnologia deve ter no máximo 50 caracteres.");
      return;
    }

    if (payload.availability.length > 100) {
      setLocalError("A disponibilidade deve ter no máximo 100 caracteres.");
      return;
    }

    if (payload.materialsUrl) {
      try {
        const url = new URL(payload.materialsUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        setLocalError("O link de materiais deve ser uma URL http(s) válida.");
        return;
      }
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch {
      // O erro da API é exibido pela página através da prop error.
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = loading || submitting;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="group-edit-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome *</label>
            <input
              name="name"
              defaultValue={group.title || ""}
              placeholder="Ex: React Hooks Avançados"
              maxLength={120}
              required
            />
          </div>

          <div className="input-group">
            <label>Descrição</label>
            <textarea
              name="description"
              defaultValue={group.description || ""}
              placeholder="Descreva o objetivo do grupo"
              rows="4"
              maxLength={500}
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Tecnologia</label>
              <input name="technology" defaultValue={group.technology || ""} placeholder="React" maxLength={50} />
            </div>
            <div className="input-group">
              <label>Nível</label>
              <select name="level" defaultValue={group.level || ""}>
                <option value="">Aberto</option>
                {GROUP_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Disponibilidade</label>
              <input
                name="availability"
                list="group-availabilities"
                defaultValue={group.availability || ""}
                placeholder="Ex: Seg-Sex noite"
                maxLength={100}
              />
              <datalist id="group-availabilities">
                {GROUP_AVAILABILITIES.map((availability) => (
                  <option key={availability} value={availability} />
                ))}
              </datalist>
            </div>
            <div className="input-group">
              <label>Link de materiais</label>
              <input name="materialsUrl" defaultValue={group.materialsUrl || ""} placeholder="https://..." maxLength={255} />
            </div>
          </div>

          {(localError || error) && <p role="alert">{localError || error}</p>}

          <div className="modal-actions">
            <Button onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
            <Button className="btn--primary" type="submit" disabled={isBusy}>
              {isBusy ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
