import { useState } from "react";
import Button from "../ui/Button";
import StarRating from "./StarRating";

export default function MentorshipEvaluationModal({ mentorship, onClose, onSubmit, error = "", loading = false }) {
  const [rating, setRating] = useState(mentorship.rating || 0);
  const [comment, setComment] = useState(mentorship.comment || "");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setLocalError("Selecione uma nota entre 1 e 5 estrelas.");
      return;
    }

    if (comment.trim().length > 255) {
      setLocalError("O comentário deve ter no máximo 255 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch {
      // A mensagem de erro da API é recebida pela prop error.
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
        aria-labelledby="mentorship-evaluation-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="mentorship-evaluation-title">Avaliar mentoria</h2>
            <p className="page-subtitle">{mentorship.mentorName}</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div>
            <p className="field-label" style={{ marginBottom: 8 }}>
              Nota *
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="input-group">
            <label>Comentário</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi a mentoria (opcional)"
              rows="4"
              maxLength={255}
            />
            <span className="mini-meta">{comment.length}/255</span>
          </div>

          {(localError || error) && <p role="alert">{localError || error}</p>}

          <div className="modal-actions">
            <Button onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
            <Button className="btn--primary" type="submit" disabled={isBusy}>
              {isBusy ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
