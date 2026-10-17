import Button from "../ui/Button";
import { forumTags } from "../../services/forumService";

export default function TopicFormModal({ title, subtitle, submitLabel, initialTopic = {}, onClose, onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      originalTitle: String(formData.get("originalTitle") || ""),
      title: String(formData.get("title") || "").trim(),
      content: String(formData.get("content") || "").trim(),
      tags: formData.getAll("tags").map((tag) => String(tag)),
    };

    if (!payload.title || !payload.content) {
      return;
    }

    onSubmit(payload);
    e.currentTarget.reset();
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thread-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="thread-form-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input type="hidden" name="originalTitle" value={initialTopic.title || ""} />

          <div className="input-group">
            <label>Título</label>
            <input name="title" defaultValue={initialTopic.title || ""} placeholder="Ex: Como estudar React Hooks?" />
          </div>

          <div className="input-group">
            <label>Conteúdo</label>
            <textarea
              name="content"
              defaultValue={initialTopic.content || ""}
              placeholder="Descreva sua dúvida ou discussão..."
              rows="6"
            />
          </div>

          <fieldset className="tag-fieldset">
            <legend>Tecnologias</legend>
            <div className="tag-options">
              {forumTags.map((tag) => (
                <label className="tag-option" key={tag}>
                  <input type="checkbox" name="tags" value={tag} defaultChecked={initialTopic.tags?.includes(tag)} />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="modal-actions">
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="btn--primary" type="submit">
              {submitLabel}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
