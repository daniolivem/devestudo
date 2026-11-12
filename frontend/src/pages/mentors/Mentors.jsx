import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import MentorCard from "../../components/mentorship/MentorCard";
import MentorshipEvaluationModal from "../../components/mentorship/MentorshipEvaluationModal";
import MentorshipRequestModal from "../../components/mentorship/MentorshipRequestModal";
import StarRating from "../../components/mentorship/StarRating";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useMentors } from "../../hooks/useMentors";
import { useMentorships } from "../../hooks/useMentorships";
import { mentorshipStatus, TECHNOLOGIES } from "../../services/mentorshipService";

function formatDate(value) {
  if (!value) return "Data não informada";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }) {
  const info = mentorshipStatus[status] || mentorshipStatus.REQUESTED;
  return <span className="status-badge">{info.label}</span>;
}

function MentorshipRow({ mentorship, perspective = "student", children }) {
  const info = mentorship.statusInfo || mentorshipStatus[mentorship.status] || mentorshipStatus.REQUESTED;
  const title = perspective === "mentor" ? mentorship.studentName : mentorship.mentorName;
  const counterpart =
    perspective === "mentor" ? `Mentor: ${mentorship.mentorName}` : `Aluno: ${mentorship.studentName}`;

  return (
    <article className="mentorship-row">
      <div>
        <h3>{title}</h3>
        <p className="mini-meta">
          {counterpart} • Solicitada em {formatDate(mentorship.createdAt)}
        </p>
        {mentorship.message && <p className="mentorship-message">“{mentorship.message}”</p>}
        <p className="mentorship-message">{info.description}</p>
        {mentorship.wasEvaluated && (
          <div className="mentor-rating-display">
            <StarRating value={mentorship.rating} readOnly />
            <strong>{mentorship.rating} / 5.0</strong>
            {mentorship.comment && <span className="mini-meta">— {mentorship.comment}</span>}
          </div>
        )}
      </div>
      <StatusBadge status={mentorship.status} />
      {children}
    </article>
  );
}

function TechnologyFilter({ value, onChange }) {
  return (
    <section className="card filter-bar" aria-label="Filtro de mentores">
      <div className="input-group">
        <label>Tecnologia</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Todas</option>
          {TECHNOLOGIES.map((technology) => (
            <option key={technology} value={technology}>
              {technology}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default function Mentors() {
  const { user, loading: sessionLoading } = useAuthSession();
  const [technology, setTechnology] = useState("");
  const { mentors, loading: mentorsLoading, error: mentorsError } = useMentors({ technology });
  const {
    mentorships,
    loading: mentorshipsLoading,
    error: mentorshipsError,
    actionLoading,
    actionError,
    successMessage,
    requestMentorship,
    evaluateMentorship,
    updateMentorshipStatus,
    clearMessages,
  } = useMentorships();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [evaluationMentorship, setEvaluationMentorship] = useState(null);

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!user) return <Navigate to="/" replace />;

  async function handleRequestMentorship(message) {
    try {
      await requestMentorship(selectedMentor.id, message);
      setSelectedMentor(null);
    } catch {
      // actionError já exibe a mensagem no modal.
    }
  }

  async function handleEvaluate({ rating, comment }) {
    try {
      await evaluateMentorship(evaluationMentorship.id, { rating, comment });
      setEvaluationMentorship(null);
    } catch {
      // actionError já exibe a mensagem no modal.
    }
  }

  async function handleStatus(mentorshipId, status) {
    try {
      await updateMentorshipStatus(mentorshipId, status);
    } catch {
      // actionError já exibe a mensagem.
    }
  }

  function openEvaluation(mentorship) {
    clearMessages();
    setEvaluationMentorship(mentorship);
  }

  function openRequest(mentor) {
    clearMessages();
    setSelectedMentor(mentor);
  }

  const isAdmin = user.role === "ADMIN";
  const isMentor = user.role === "MENTOR";
  const receivedMentorships = mentorships.filter((mentorship) => mentorship.mentorId === user.id);
  const evaluableMentorships = mentorships.filter(
    (mentorship) => mentorship.studentId === user.id && mentorship.canEvaluate && !mentorship.wasEvaluated,
  );

  if (isAdmin) {
    return (
      <Layout>
        <header className="page-header mentors-admin-header">
          <div>
            <h1 className="page-title">Gestão de Mentoria</h1>
            <p className="page-subtitle">
              Mentores cadastrados na plataforma. Use a tela de usuários para alterar roles e bloquear contas.
            </p>
          </div>
          <Link className="btn btn--primary" to="/users">
            Gerenciar usuários
          </Link>
        </header>

        <TechnologyFilter value={technology} onChange={setTechnology} />
        {successMessage && <p role="status">{successMessage}</p>}
        {actionError && <p role="alert">{actionError}</p>}
        {mentorsError && <p role="alert">{mentorsError}</p>}

        <section className="card admin-mentors-panel">
          <div className="mentorship-section-header">
            <div>
              <h2>Mentores cadastrados</h2>
              <p className="page-subtitle">Dados carregados da API de mentores.</p>
            </div>
          </div>

          {mentorsLoading ? (
            <p role="status">Carregando mentores…</p>
          ) : mentors.length === 0 ? (
            <p className="modal-message">Nenhum mentor encontrado.</p>
          ) : (
            <div className="admin-mentors-head">
              <span>Mentor</span>
              <span>Disponibilidade</span>
              <span>Canal</span>
              <span>Avaliação</span>
            </div>
          )}

          <div className="list-divider">
            {mentors.map((mentor) => (
              <article className="admin-mentor-row" key={mentor.id}>
                <div>
                  <div className="admin-mentor-name-row">
                    <h3>{mentor.name}</h3>
                    <span className="status-badge">Ativo</span>
                  </div>
                  <p className="mini-meta">{mentor.email}</p>
                  <div className="chip-list">
                    {mentor.tags.map((tag) => (
                      <span className="chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span>{mentor.availability}</span>
                <span>{mentor.channel}</span>
                <span>
                  {mentor.hasRating ? `${mentor.rating.toFixed(1)} / 5.0` : "Sem avaliações"}
                  <br />
                  <span className="mini-meta">{mentor.sessions} sessões</span>
                </span>
              </article>
            ))}
          </div>
        </section>
      </Layout>
    );
  }

  if (isMentor) {
    return (
      <Layout>
        <header className="page-header">
          <h1 className="page-title">Sistema de Mentoria Alunos</h1>
          <p className="page-subtitle">Aprove, recuse e acompanhe as solicitações recebidas.</p>
        </header>

        {successMessage && <p role="status">{successMessage}</p>}
        {actionError && <p role="alert">{actionError}</p>}
        {mentorshipsError && <p role="alert">{mentorshipsError}</p>}

        <section className="card mentorship-status-panel">
          <div className="mentorship-section-header">
            <div>
              <h2>Solicitações recebidas</h2>
              <p className="page-subtitle">Aprove ou recuse pedidos de mentoria dos alunos.</p>
            </div>
          </div>

          {mentorshipsLoading ? (
            <p role="status">Carregando solicitações…</p>
          ) : receivedMentorships.length === 0 ? (
            <p className="modal-message">Nenhuma solicitação de mentoria recebida até agora.</p>
          ) : (
            <div className="list-divider">
              {receivedMentorships.map((mentorship) => (
                <MentorshipRow mentorship={mentorship} perspective="mentor" key={mentorship.id}>
                  {mentorship.status === "REQUESTED" ? (
                    <div className="mentorship-actions">
                      <Button
                        className="btn--primary btn--small"
                        disabled={actionLoading}
                        onClick={() => handleStatus(mentorship.id, "APPROVED")}
                      >
                        Aprovar
                      </Button>
                      <Button
                        className="btn--small"
                        disabled={actionLoading}
                        onClick={() => handleStatus(mentorship.id, "CANCELLED")}
                      >
                        Recusar
                      </Button>
                    </div>
                  ) : (
                    <p className="mini-meta">{mentorship.statusInfo.description}</p>
                  )}
                </MentorshipRow>
              ))}
            </div>
          )}
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Sistema de Mentoria</h1>
        <p className="page-subtitle">Conecte-se com mentores especializados na sua stack</p>
      </header>

      {successMessage && <p role="status">{successMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {mentorshipsError && <p role="alert">{mentorshipsError}</p>}

      <section className="card mentorship-status-panel">
        <div className="mentorship-section-header">
          <div>
            <h2>Minhas mentorias</h2>
            <p className="page-subtitle">Acompanhe solicitações enviadas e mentorias aprovadas.</p>
          </div>
        </div>

        {mentorshipsLoading ? (
          <p role="status">Carregando suas mentorias…</p>
        ) : mentorships.length === 0 ? (
          <p className="modal-message">Você ainda não solicitou mentorias.</p>
        ) : (
          <div className="mentorship-list-scroll list-divider">
            {mentorships.map((mentorship) => (
              <MentorshipRow mentorship={mentorship} key={mentorship.id}>
                {mentorship.status === "REQUESTED" && (
                  <Button
                    className="btn--small"
                    disabled={actionLoading}
                    onClick={() => handleStatus(mentorship.id, "CANCELLED")}
                  >
                    Cancelar
                  </Button>
                )}
                {mentorship.canEvaluate && !mentorship.wasEvaluated && (
                  <Button className="btn--primary btn--small" onClick={() => openEvaluation(mentorship)}>
                    Avaliar
                  </Button>
                )}
              </MentorshipRow>
            ))}
          </div>
        )}
      </section>

      {evaluableMentorships.length > 0 && (
        <section className="card wide-card">
          <h2 style={{ fontSize: 20, marginBottom: 10 }}>Avaliações pendentes</h2>
          <p className="page-subtitle">Registre uma nota para uma mentoria aprovada ou concluída.</p>
          <div className="list-divider">
            {evaluableMentorships.map((mentorship) => (
              <div className="mentorship-row" key={mentorship.id}>
                <div>
                  <h3>{mentorship.mentorName}</h3>
                  <p className="mini-meta">Solicitada em {formatDate(mentorship.createdAt)}</p>
                </div>
                <Button className="btn--primary btn--small" onClick={() => openEvaluation(mentorship)}>
                  Avaliar mentoria
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <TechnologyFilter value={technology} onChange={setTechnology} />
      {mentorsError && <p role="alert">{mentorsError}</p>}

      {mentorsLoading ? (
        <p role="status">Carregando mentores…</p>
      ) : mentors.length === 0 ? (
        <section className="card">
          <p className="modal-message">Nenhum mentor encontrado para a tecnologia selecionada.</p>
        </section>
      ) : (
        <div className="grid-2">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} onSchedule={openRequest} />
          ))}
        </div>
      )}

      {selectedMentor && (
        <MentorshipRequestModal
          mentor={selectedMentor}
          onClose={() => {
            setSelectedMentor(null);
            clearMessages();
          }}
          onConfirm={handleRequestMentorship}
          error={actionError}
          loading={actionLoading}
        />
      )}

      {evaluationMentorship && (
        <MentorshipEvaluationModal
          mentorship={evaluationMentorship}
          onClose={() => {
            setEvaluationMentorship(null);
            clearMessages();
          }}
          onSubmit={handleEvaluate}
          error={actionError}
          loading={actionLoading}
        />
      )}
    </Layout>
  );
}
