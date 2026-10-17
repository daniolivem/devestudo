import Button from "../ui/Button";
import VoteButton from "./VoteButton";
import { formatLastInteraction } from "../../utils/forum";

export default function TopicCard({ topic, isAdmin, isMentor, onOpen, onEdit, onDelete, onUpvote }) {
  const canManage = isAdmin || (isMentor && topic.createdByCurrentMentor);

  function handleKeyboardOpen(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(topic);
    }
  }

  return (
    <article className="card topic-card topic-card--clickable" onClick={() => onOpen(topic)} tabIndex="0" onKeyDown={handleKeyboardOpen}>
      <div>
        <h2 className="topic-title">{topic.title}</h2>
        <p className="topic-meta">
          <span>por {topic.author}</span>
          <span>•</span>
          <span>Última interação {formatLastInteraction(topic.lastInteractionHours)}</span>
          <span>•</span>
          <span>{topic.replies} respostas</span>
          {isMentor && topic.createdByCurrentMentor && (
            <>
              <span>•</span>
              <span>Criado por você</span>
            </>
          )}
        </p>
        {topic.content && <p className="topic-preview">{topic.content}</p>}
        {topic.tags.length > 0 && (
          <div className="chip-list" style={{ marginTop: 16 }}>
            {topic.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="topic-side">
        <VoteButton
          count={topic.votes}
          hasVoted={topic.hasVoted}
          onClick={(e) => {
            e.stopPropagation();
            onUpvote(topic.title);
          }}
        />
        {canManage ? (
          <div className="forum-admin-actions">
            <Button
              className="btn--small"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(topic);
              }}
            >
              {isAdmin ? "Moderar" : "Abrir"}
            </Button>
            <Button
              className="btn--small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(topic);
              }}
            >
              Editar
            </Button>
            <Button
              className="btn--small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(topic.title);
              }}
            >
              Excluir
            </Button>
          </div>
        ) : (
          <p className="topic-replies mini-meta">
            {topic.replies}
            <br />
            respostas
          </p>
        )}
      </div>
    </article>
  );
}
