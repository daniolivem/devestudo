import Button from "../ui/Button";
import StarRating from "./StarRating";

export default function MentorCard({ mentor, onSchedule }) {
  return (
    <article className="card mentor-card">
      <h2>{mentor.name}</h2>
      <p className="mentor-copy">{mentor.role}</p>
      {mentor.tags.length > 0 ? (
        <div className="chip-list">
          {mentor.tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="mini-meta">Tecnologias ainda não informadas.</p>
      )}
      <div className="mentor-stats">
        <div className="mentor-rating-display">
          {mentor.hasRating ? (
            <>
              <StarRating value={mentor.rating} readOnly />
              <strong>{mentor.rating.toFixed(1)} / 5.0</strong>
            </>
          ) : (
            <span className="soft">Sem avaliações ainda</span>
          )}
        </div>
        <span className="soft">
          {mentor.sessions} {mentor.sessions === 1 ? "sessão realizada" : "sessões realizadas"}
        </span>
        <span>
          Disponível: <span>{mentor.availability}</span>
        </span>
        <span>Canal: {mentor.channel}</span>
      </div>
      {mentor.calendlyUrl && (
        <p className="mini-meta">
          <a href={mentor.calendlyUrl} target="_blank" rel="noreferrer">
            Abrir link de agendamento
          </a>
        </p>
      )}
      <Button className="btn--primary" onClick={() => onSchedule(mentor)}>
        Agendar Sessão
      </Button>
    </article>
  );
}
