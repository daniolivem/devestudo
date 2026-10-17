import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import MentorCard from "../../components/mentorship/MentorCard";
import MentorshipRequestModal from "../../components/mentorship/MentorshipRequestModal";
import StarRating from "../../components/mentorship/StarRating";
import { useMentorships } from "../../hooks/useMentorships";
import {
  initialMentorRequests,
  mentors,
  mentorshipStatus,
  ratingToNumber,
  students,
} from "../../services/mentorshipService";

const itemsPerPage = 10;

function MentorStudents() {
  const [mentorRequests, setMentorRequests] = useState(initialMentorRequests);
  const [managedStudents, setManagedStudents] = useState(() => students.map((student) => ({ ...student, isBlocked: false })));

  function updateRequestStatus(requestId, status) {
    setMentorRequests((currentRequests) =>
      currentRequests.map((request) => (request.id === requestId ? { ...request, status } : request)),
    );
  }

  function toggleStudentBlock(studentName) {
    setManagedStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.name === studentName ? { ...student, isBlocked: !student.isBlocked } : student,
      ),
    );
  }

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Sistema de Mentoria Alunos</h1>
        <p className="page-subtitle">Alunos em sua mentoria</p>
      </header>

      <section className="card mentorship-status-panel">
        <div className="mentorship-section-header">
          <div>
            <h2>Solicitações recebidas</h2>
            <p className="page-subtitle">Aprove ou recuse pedidos de mentoria dos alunos.</p>
          </div>
        </div>

        <div className="list-divider">
          {mentorRequests.map((request) => (
            <article className="mentorship-row" key={request.id}>
              <div>
                <h3>{request.studentName}</h3>
                <p className="mini-meta">{request.topic}</p>
                <p className="mentorship-message">{request.message}</p>
              </div>

              <span className="status-badge">{mentorshipStatus[request.status].label}</span>

              {request.status === "REQUESTED" ? (
                <div className="mentorship-actions">
                  <Button className="btn--primary btn--small" onClick={() => updateRequestStatus(request.id, "APPROVED")}>
                    Aprovar
                  </Button>
                  <Button className="btn--small" onClick={() => updateRequestStatus(request.id, "CANCELLED")}>
                    Recusar
                  </Button>
                </div>
              ) : (
                <p className="mini-meta">{mentorshipStatus[request.status].description}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="grid-2">
        {managedStudents.map((student) => (
          <article className="card mentor-card mentor-student-card" key={student.name}>
            <div className="mentor-student-heading">
              <h2>{student.name}</h2>
              {student.isBlocked && <span className="status-badge status-badge--blocked">Bloqueado</span>}
            </div>
            <p className="mentor-copy">{student.role}</p>
            <div className="chip-list">
              {student.tags.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="mentor-stats">
              <strong>0 mensagens</strong>
              <span className="soft">{student.sessions} sessões realizadas</span>
              <span>{student.isBlocked ? "Acesso bloqueado" : "Offline"}</span>
            </div>
            <div className="mentor-card-actions">
              <Button className="btn--primary btn--small" disabled={student.isBlocked}>
                Responder
              </Button>
              <Button className="btn--small" onClick={() => toggleStudentBlock(student.name)}>
                {student.isBlocked ? "Desbloquear" : "Bloquear"}
              </Button>
              <Button className="btn--small btn--danger">Excluir</Button>
            </div>
          </article>
        ))}
      </div>

    </Layout>
  );
}

function AdminMentorshipManagement() {
  const [mentorRequests, setMentorRequests] = useState(initialMentorRequests);
  const [managedMentors, setManagedMentors] = useState(() => mentors.map((mentor) => ({ ...mentor, isBlocked: false })));
  const [editingMentor, setEditingMentor] = useState(null);
  const [requestsPage, setRequestsPage] = useState(1);
  const [mentorsPage, setMentorsPage] = useState(1);
  const requestsStartIndex = (requestsPage - 1) * itemsPerPage;
  const mentorsStartIndex = (mentorsPage - 1) * itemsPerPage;
  const visibleRequests = mentorRequests.slice(requestsStartIndex, requestsStartIndex + itemsPerPage);
  const visibleMentors = managedMentors.slice(mentorsStartIndex, mentorsStartIndex + itemsPerPage);

  function updateRequestStatus(requestId, status) {
    setMentorRequests((currentRequests) =>
      currentRequests.map((request) => (request.id === requestId ? { ...request, status } : request)),
    );
  }

  function handleMentorSave(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const originalName = String(formData.get("originalName") || "");
    const name = String(formData.get("name") || "").trim();
    const role = String(formData.get("role") || "").trim();
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const availability = String(formData.get("availability") || "").trim();
    const channel = String(formData.get("channel") || "").trim();
    const format = String(formData.get("format") || "").trim();
    const instructions = String(formData.get("instructions") || "").trim();

    if (!name || !role) {
      return;
    }

    const savedMentor = {
      name,
      role,
      tags,
      rating: editingMentor?.rating || "Novo",
      sessions: editingMentor?.sessions || "0 sessões realizadas",
      availability,
      channel,
      format,
      instructions,
      isBlocked: Boolean(editingMentor?.isBlocked),
    };

    setManagedMentors((currentMentors) => {
      if (!originalName) {
        return [savedMentor, ...currentMentors];
      }

      return currentMentors.map((mentor) => (mentor.name === originalName ? savedMentor : mentor));
    });
    setMentorsPage(1);
    setEditingMentor(null);
  }

  function deleteMentor(mentorName) {
    setManagedMentors((currentMentors) => {
      const nextMentors = currentMentors.filter((mentor) => mentor.name !== mentorName);
      const nextTotalPages = Math.max(1, Math.ceil(nextMentors.length / itemsPerPage));
      setMentorsPage((page) => Math.min(page, nextTotalPages));
      return nextMentors;
    });
  }

  function toggleMentorBlock(mentorName) {
    setManagedMentors((currentMentors) =>
      currentMentors.map((mentor) =>
        mentor.name === mentorName ? { ...mentor, isBlocked: !mentor.isBlocked } : mentor,
      ),
    );
  }

  return (
    <Layout>
      <header className="page-header mentors-admin-header">
        <div>
          <h1 className="page-title">Gestão de Mentoria</h1>
          <p className="page-subtitle">Gerencie solicitações, mentores cadastrados e suas preferências como mentor.</p>
        </div>
        <Button className="btn--primary" onClick={() => setEditingMentor({})}>
          Cadastrar mentor
        </Button>
      </header>

      <section className="card mentorship-status-panel">
        <div className="mentorship-section-header">
          <div>
            <h2>Solicitações de mentoria</h2>
            <p className="page-subtitle">Controle aprovações, recusas e acompanhamento dos pedidos.</p>
          </div>
        </div>

        <div className="mentorship-list-scroll list-divider">
          {visibleRequests.map((request) => (
            <article className="mentorship-row" key={request.id}>
              <div>
                <h3>{request.studentName}</h3>
                <p className="mini-meta">{request.topic}</p>
                <p className="mentorship-message">{request.message}</p>
              </div>

              <span className="status-badge">{mentorshipStatus[request.status].label}</span>

              {request.status === "REQUESTED" ? (
                <div className="mentorship-actions">
                  <Button className="btn--primary btn--small" onClick={() => updateRequestStatus(request.id, "APPROVED")}>
                    Aprovar
                  </Button>
                  <Button className="btn--small" onClick={() => updateRequestStatus(request.id, "CANCELLED")}>
                    Recusar
                  </Button>
                </div>
              ) : (
                <p className="mini-meta">{mentorshipStatus[request.status].description}</p>
              )}
            </article>
          ))}
        </div>
        <Pagination
          currentPage={requestsPage}
          totalItems={mentorRequests.length}
          itemsPerPage={itemsPerPage}
          itemLabel="solicitações"
          onPageChange={setRequestsPage}
        />
      </section>

      <section className="card admin-mentors-panel">
        <div className="mentorship-section-header">
          <div>
            <h2>Mentores cadastrados</h2>
            <p className="page-subtitle">Edite disponibilidade, canais, stacks e remova cadastros quando necessário.</p>
          </div>
        </div>

        <div className="admin-mentors-head">
          <span>Mentor</span>
          <span>Disponibilidade</span>
          <span>Canal</span>
          <span>Ações</span>
        </div>

        <div className="list-divider">
          {visibleMentors.map((mentor) => (
            <article className="admin-mentor-row" key={mentor.name}>
              <div>
                <div className="admin-mentor-name-row">
                  <h3>{mentor.name}</h3>
                  <span className={mentor.isBlocked ? "status-badge status-badge--blocked" : "status-badge"}>
                    {mentor.isBlocked ? "Bloqueado" : "Ativo"}
                  </span>
                </div>
                <p className="mini-meta">{mentor.role}</p>
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
              <div className="mentorship-actions">
                <Button className="btn--small" onClick={() => setEditingMentor(mentor)}>
                  Editar
                </Button>
                <Button className="btn--small" onClick={() => toggleMentorBlock(mentor.name)}>
                  {mentor.isBlocked ? "Desbloquear" : "Bloquear"}
                </Button>
                <Button className="btn--small btn--danger" onClick={() => deleteMentor(mentor.name)}>
                  Remover
                </Button>
              </div>
            </article>
          ))}
        </div>
        <Pagination
          currentPage={mentorsPage}
          totalItems={managedMentors.length}
          itemsPerPage={itemsPerPage}
          itemLabel="mentores"
          onPageChange={setMentorsPage}
        />
      </section>

      {editingMentor && (
        <div className="modal-backdrop" role="presentation" onClick={() => setEditingMentor(null)}>
          <section
            className="card modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="mentor-edit-title">{editingMentor.name ? "Editar mentor" : "Cadastrar mentor"}</h2>
                <p className="page-subtitle">Atualize os dados exibidos para os alunos.</p>
              </div>
            </div>

            <form className="modal-form" onSubmit={handleMentorSave}>
              <input type="hidden" name="originalName" value={editingMentor.name || ""} />

              <div className="grid-2">
                <div className="input-group">
                  <label>Nome</label>
                  <input name="name" defaultValue={editingMentor.name || ""} />
                </div>
                <div className="input-group">
                  <label>Área</label>
                  <input name="role" defaultValue={editingMentor.role || ""} />
                </div>
              </div>

              <div className="input-group">
                <label>Tecnologias</label>
                <input name="tags" defaultValue={editingMentor.tags?.join(", ") || ""} placeholder="React, Node.js, Docker" />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Disponibilidade</label>
                  <input name="availability" defaultValue={editingMentor.availability || ""} />
                </div>
                <div className="input-group">
                  <label>Canal</label>
                  <input name="channel" defaultValue={editingMentor.channel || ""} />
                </div>
              </div>

              <div className="input-group">
                <label>Formato</label>
                <input name="format" defaultValue={editingMentor.format || ""} />
              </div>

              <div className="input-group">
                <label>Orientações</label>
                <textarea name="instructions" defaultValue={editingMentor.instructions || ""} rows="5" />
              </div>

              <div className="modal-actions">
                <Button onClick={() => setEditingMentor(null)}>Cancelar</Button>
                <Button className="btn--primary" type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </Layout>
  );
}

export default function Mentors() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestedMentor, setRequestedMentor] = useState(null);
  const { mentorships: studentMentorships, requestMentorship } = useMentorships();
  const [mentorRatings, setMentorRatings] = useState(() =>
    Object.fromEntries(mentors.map((mentor) => [mentor.name, ratingToNumber(mentor.rating)])),
  );
  const [feedbackMentor, setFeedbackMentor] = useState(mentors[0].name);
  const [feedbackRating, setFeedbackRating] = useState(5);

  if (role === "admin") {
    return <AdminMentorshipManagement />;
  }

  if (role === "mentor") {
    return <MentorStudents />;
  }

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Sistema de Mentoria</h1>
        <p className="page-subtitle">Conecte-se com mentores especializados na sua stack</p>
      </header>

      <section className="card mentorship-status-panel">
        <div className="mentorship-section-header">
          <div>
            <h2>Minhas mentorias</h2>
            <p className="page-subtitle">Acompanhe solicitações enviadas e mentorias aprovadas.</p>
          </div>
        </div>

        {studentMentorships.length > 0 ? (
          <div className="mentorship-list-scroll list-divider">
            {studentMentorships.map((mentorship) => (
              <article className="mentorship-row" key={`${mentorship.mentorName}-${mentorship.status}`}>
                <div>
                  <h3>{mentorship.mentorName}</h3>
                  <p className="mini-meta">{mentorship.role}</p>
                  <p className="mentorship-message">{mentorshipStatus[mentorship.status].description}</p>
                  {mentorship.status === "APPROVED" && (
                    <p className="mini-meta">
                      Canal: {mentorship.channel} • Disponibilidade: {mentorship.availability}
                    </p>
                  )}
                </div>
                <span className="status-badge">{mentorshipStatus[mentorship.status].label}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="modal-message">Você ainda não solicitou mentorias.</p>
        )}
      </section>

      <div className="grid-2">
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.name}
            mentor={mentor}
            rating={mentorRatings[mentor.name]}
            onSchedule={setSelectedMentor}
          />
        ))}
      </div>

      <section className="card wide-card">
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Avaliar Mentoria</h2>
        <p className="page-subtitle">Registre uma nota para uma mentoria concluída.</p>
        <form
          className="mentor-feedback-form"
          onSubmit={(e) => {
            e.preventDefault();
            setMentorRatings((currentRatings) => ({ ...currentRatings, [feedbackMentor]: feedbackRating }));
          }}
        >
          <div className="input-group">
            <label>Mentor</label>
            <select value={feedbackMentor} onChange={(e) => setFeedbackMentor(e.target.value)}>
              {mentors.map((mentor) => (
                <option key={mentor.name}>{mentor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="field-label" style={{ marginBottom: 8 }}>
              Nota
            </p>
            <StarRating value={feedbackRating} onChange={setFeedbackRating} />
          </div>
          <Button className="btn--primary" type="submit">
            Salvar avaliação
          </Button>
        </form>
      </section>

      {selectedMentor && (
        <MentorshipRequestModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onConfirm={() => {
            requestMentorship(selectedMentor);
            setRequestedMentor(selectedMentor);
            setSelectedMentor(null);
          }}
        />
      )}

      {requestedMentor && (
        <div className="modal-backdrop" role="presentation" onClick={() => setRequestedMentor(null)}>
          <section
            className="card modal-card modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentorship-request-sent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="mentorship-request-sent">Solicitação enviada</h2>
                <p className="page-subtitle">{requestedMentor.name}</p>
              </div>
            </div>

            <p className="modal-message">
              Sua solicitação de mentoria foi enviada. Aguarde o mentor aprovar e combinar os detalhes da sessão fora da
              plataforma.
            </p>

            <div className="modal-actions">
              <Button className="btn--primary" onClick={() => setRequestedMentor(null)}>
                Entendi
              </Button>
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
}
