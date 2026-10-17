import Button from "../ui/Button";
import VoteButton from "./VoteButton";

export default function ReplyCard({ reply, isAdmin, onDelete, onUpvote }) {
  return (
    <article className="card reply-card">
      <div className="reply-header">
        <div>
          <strong>{reply.author}</strong>
          <p className="mini-meta">{reply.time}</p>
        </div>
        <div className="reply-actions">
          <VoteButton count={reply.votes} hasVoted={reply.hasVoted} compact onClick={onUpvote} label="" />
          {isAdmin && (
            <Button className="btn--small" onClick={onDelete}>
              Excluir resposta
            </Button>
          )}
        </div>
      </div>
      <p>{reply.content}</p>
    </article>
  );
}
