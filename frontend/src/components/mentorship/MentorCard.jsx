import Button from "../ui/Button";
import StarRating from "./StarRating";

export default function MentorCard({ mentor, rating, onSchedule }) {
  return (
    <article className="card mentor-card">
      <h2>{mentor.name}</h2>
      <p className="mentor-copy">{mentor.role}</p>
      <div className="chip-list">
        {mentor.tags.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="mentor-stats">
        <div className="mentor-rating-display">
          <StarRating value={rating} readOnly />
          <strong>{rating.toFixed(1)} / 5.0</strong>
        </div>
        <span className="soft">{mentor.sessions}</span>
        <span>
          Disponível: <span>{mentor.availability}</span>
        </span>
        <span>Canal: {mentor.channel}</span>
      </div>
      <Button className="btn--primary" onClick={() => onSchedule(mentor)}>
        Agendar Sessão
      </Button>
    </article>
  );
}
