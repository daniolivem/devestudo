import Button from "../ui/Button";

export default function GroupRequestModal({ group, onClose }) {
  if (!group) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card modal-card--small"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-request-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="group-request-title">Entrada solicitada</h2>
            <p className="page-subtitle">{group.title}</p>
          </div>
        </div>

        <p className="modal-message">
          Sua solicitação foi enviada. Aguarde a aprovação de um administrador ou responsável pelo grupo.
        </p>

        <div className="modal-actions">
          <Button className="btn--primary" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </section>
    </div>
  );
}
