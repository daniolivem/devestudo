import Button from "../ui/Button";

export default function GroupFormModal({ group = {}, title, subtitle, onClose, onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      originalTitle: String(formData.get("originalTitle") || ""),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      technology: String(formData.get("technology") || "").trim(),
      level: String(formData.get("level") || "").trim(),
      time: String(formData.get("time") || "").trim(),
    };

    if (!payload.title || !payload.description) {
      return;
    }

    onSubmit(payload);
  }

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
          <input type="hidden" name="originalTitle" value={group.title || ""} />

          <div className="input-group">
            <label>Nome</label>
            <input name="title" defaultValue={group.title || ""} placeholder="Ex: React Hooks Avançados" />
          </div>

          <div className="input-group">
            <label>Descrição</label>
            <textarea name="description" defaultValue={group.description || ""} placeholder="Descreva o objetivo do grupo" rows="4" />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Tecnologia</label>
              <input name="technology" defaultValue={group.tags?.[0] || ""} placeholder="React" />
            </div>
            <div className="input-group">
              <label>Nível</label>
              <input name="level" defaultValue={group.tags?.[1] || ""} placeholder="Intermediário" />
            </div>
          </div>

          <div className="input-group">
            <label>Disponibilidade</label>
            <input name="time" defaultValue={group.time || ""} placeholder="Noite" />
          </div>

          <div className="modal-actions">
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="btn--primary" type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
