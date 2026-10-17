import Button from "../ui/Button";

export default function MentorshipRequestModal({ mentor, onClose, onConfirm }) {
  function handleSubmit(e) {
    e.preventDefault();
    onConfirm();
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentorship-request-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="mentorship-request-title">Solicitar mentoria com {mentor.name}</h2>
            <p className="page-subtitle">As sessões acontecem fora da plataforma</p>
          </div>
        </div>

        <div className="mentor-session-summary">
          <p>
            Após sua solicitação, o mentor poderá aprovar o pedido e combinar canal, horário e formato da conversa
            conforme as preferências abaixo.
          </p>

          <div className="mentor-session-details">
            <div>
              <strong>Disponibilidade</strong>
              <span>{mentor.availability}</span>
            </div>
            <div>
              <strong>Canal</strong>
              <span>{mentor.channel}</span>
            </div>
            <div>
              <strong>Formato</strong>
              <span>{mentor.format}</span>
            </div>
            <div>
              <strong>Orientações</strong>
              <span>{mentor.instructions}</span>
            </div>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Mensagem para o mentor</label>
            <textarea name="message" placeholder="Conte brevemente o que você quer estudar ou resolver..." rows="5" />
          </div>

          <div className="modal-actions">
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="btn--primary" type="submit">
              Solicitar mentoria
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
