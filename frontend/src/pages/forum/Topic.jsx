import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import ReplyCard from "../../components/forum/ReplyCard";
import VoteButton from "../../components/forum/VoteButton";
import { fallbackTitleFromSlug, formatLastInteraction } from "../../utils/forum";
import { getTopicDetails } from "../../services/forumService";

export default function Topic() {
  const { topicSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const roleQuery = role === "admin" || role === "mentor" ? `?role=${role}` : "";
  const isAdmin = role === "admin";

  const initialTopic = useMemo(() => {
    const routedTopic = location.state?.topic;

    if (routedTopic) {
      return {
        ...routedTopic,
        content: routedTopic.content || "Conteúdo inicial do fórum.",
        replies: [],
      };
    }

    return (
      getTopicDetails(topicSlug) || {
        title: fallbackTitleFromSlug(topicSlug || "forum"),
        author: "Comunidade DevEstudo",
        lastInteractionHours: 0,
        votes: 0,
        hasVoted: false,
        tags: [],
        content: "Este fórum ainda não possui conteúdo carregado localmente.",
        replies: [],
      }
    );
  }, [location.state, topicSlug]);

  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [replies, setReplies] = useState(initialTopic.replies);
  const [isEditingTopic, setIsEditingTopic] = useState(false);

  function handleReply(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = String(formData.get("content") || "").trim();

    if (!content) {
      return;
    }

    setReplies((currentReplies) => [
      ...currentReplies,
      {
        author: "Você",
        time: "agora",
        content,
        votes: 0,
        hasVoted: false,
      },
    ]);
    e.currentTarget.reset();
  }

  function handleUpdateTopic(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();

    if (!title || !content) {
      return;
    }

    setCurrentTopic((topic) => ({
      ...topic,
      title,
      content,
      lastInteractionHours: 0,
    }));
    setIsEditingTopic(false);
  }

  function deleteReply(replyToDelete) {
    setReplies((currentReplies) => currentReplies.filter((reply) => reply !== replyToDelete));
  }

  function upvoteTopic() {
    setCurrentTopic((topic) =>
      topic.hasVoted ? topic : { ...topic, votes: (topic.votes || 0) + 1, hasVoted: true },
    );
  }

  function upvoteReply(replyToUpvote) {
    setReplies((currentReplies) =>
      currentReplies.map((reply) =>
        reply === replyToUpvote && !reply.hasVoted ? { ...reply, votes: reply.votes + 1, hasVoted: true } : reply,
      ),
    );
  }

  return (
    <Layout>
      <header className="page-header topic-detail-header">
        <Button onClick={() => navigate(`/forum${roleQuery}`)}>Voltar ao fórum</Button>
      </header>

      <article className="card topic-detail">
        <div className="topic-detail-title-row">
          <h1 className="page-title">{currentTopic.title}</h1>
          {isAdmin && (
            <div className="forum-admin-actions">
              <Button className="btn--small" onClick={() => setIsEditingTopic(true)}>
                Editar
              </Button>
              <Button className="btn--small" onClick={() => navigate(`/forum${roleQuery}`)}>
                Excluir tópico
              </Button>
            </div>
          )}
        </div>
        <p className="topic-meta">
          <span>por {currentTopic.author}</span>
          <span>•</span>
          <span>Última interação {formatLastInteraction(currentTopic.lastInteractionHours)}</span>
          <span>•</span>
          <span>{replies.length} respostas</span>
        </p>

        <VoteButton count={currentTopic.votes || 0} hasVoted={currentTopic.hasVoted} inline onClick={upvoteTopic} />

        {currentTopic.tags.length > 0 && (
          <div className="chip-list topic-detail-tags">
            {currentTopic.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="topic-detail-content">{currentTopic.content}</p>
      </article>

      {isAdmin && isEditingTopic && (
        <section className="card reply-form-card">
          <h2>Editar tópico</h2>
          <form className="modal-form" onSubmit={handleUpdateTopic}>
            <div className="input-group">
              <label>Título</label>
              <input name="title" defaultValue={currentTopic.title} />
            </div>
            <div className="input-group">
              <label>Conteúdo</label>
              <textarea name="content" defaultValue={currentTopic.content} rows="6" />
            </div>
            <div className="modal-actions">
              <Button onClick={() => setIsEditingTopic(false)}>Cancelar</Button>
              <Button className="btn--primary" type="submit">
                Salvar alterações
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="topic-replies-section">
        <h2>Respostas</h2>
        <div className="stack">
          {replies.map((reply) => (
            <ReplyCard
              key={`${reply.author}-${reply.time}-${reply.content}`}
              reply={reply}
              isAdmin={isAdmin}
              onDelete={() => deleteReply(reply)}
              onUpvote={() => upvoteReply(reply)}
            />
          ))}
        </div>
      </section>

      {!isAdmin && (
        <section className="card reply-form-card">
          <h2>Adicionar resposta</h2>
          <form className="modal-form" onSubmit={handleReply}>
            <div className="input-group">
              <label>Resposta</label>
              <textarea name="content" placeholder="Escreva sua contribuição..." rows="5" />
            </div>
            <div className="modal-actions">
              <Button className="btn--primary" type="submit">
                Responder
              </Button>
            </div>
          </form>
        </section>
      )}
    </Layout>
  );
}
