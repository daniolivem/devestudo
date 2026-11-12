import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import { useAuthSession } from "../../hooks/useAuthSession";
import { listGroups, normalizeGroup } from "../../services/groupService";
import { listTopics } from "../../services/forumService";
import { listMentors } from "../../services/mentorshipService";
import { getErrorMessage, getRoleLabel, listUsers } from "../../services/userService";

function EmptyState({ children }) {
  return <p className="modal-message">{children}</p>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuthSession();
  const [data, setData] = useState({ groups: [], topics: [], mentors: [], users: [], totalTopics: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const requests = [listGroups(), listTopics({ limit: 5 }), listMentors()];

        if (user.role === "ADMIN") requests.push(listUsers());

        const [groups, topics, mentors, users = []] = await Promise.all(requests);

        if (!active) return;

        setData({
          groups: (Array.isArray(groups) ? groups : []).map(normalizeGroup),
          topics: topics?.items || [],
          totalTopics: topics?.total || topics?.items?.length || 0,
          mentors,
          users,
        });
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user]);

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!user) return <Navigate to="/" replace />;

  const isAdmin = user.role === "ADMIN";
  const adminStats = [
    { label: "Total de Usuários", value: data.users.length },
    { label: "Grupos Ativos", value: data.groups.length },
    { label: "Tópicos no Fórum", value: data.totalTopics },
    { label: "Mentores", value: data.mentors.length },
  ];

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">
          {isAdmin ? "Dashboard Administrativo" : `Bem-vindo(a), ${user.name}`}
        </h1>
        <p className="page-subtitle">
          {isAdmin
            ? "Acompanhe usuários, grupos e fóruns da comunidade"
            : "Confira suas atividades e recomendações personalizadas"}
        </p>
      </header>

      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Carregando dados do dashboard…</p>}

      {isAdmin ? (
        <>
          <div className="stats-row">
            {adminStats.map((stat) => (
              <article className="card stat-card" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>

          <div className="dashboard-grid admin-dashboard-grid">
            <section className="card admin-panel">
              <div className="admin-panel-title">
                <h2>Usuários recentes</h2>
                <Button className="btn--small" onClick={() => navigate("/users")}>
                  Ver Todos
                </Button>
              </div>
              <div className="list-divider">
                {data.users.length === 0 ? (
                  <EmptyState>Nenhum usuário cadastrado.</EmptyState>
                ) : (
                  data.users.slice(0, 5).map((item) => (
                    <article className="user-row" key={item.id}>
                      <span className="avatar" />
                      <div>
                        <p>{item.name}</p>
                        <span className="role-pill">{getRoleLabel(item.role)}</span>
                      </div>
                      <span className={item.isBlocked ? "status-badge status-badge--blocked" : "status-badge"}>
                        {item.status}
                      </span>
                    </article>
                  ))
                )}
              </div>
              <div className="card admin-stats">
                <h3>Estatísticas da comunidade</h3>
                <p>Mentores: <strong>{data.mentors.length}</strong></p>
                <p>Grupos cadastrados: <strong>{data.groups.length}</strong></p>
                <p>Tópicos no fórum: <strong>{data.totalTopics}</strong></p>
              </div>
            </section>

            <section className="card admin-panel">
              <div className="admin-panel-title">
                <h2>Grupos</h2>
                <Button className="btn--small" onClick={() => navigate("/groups")}>
                  Ver Todos
                </Button>
              </div>
              <div className="list-divider">
                {data.groups.length === 0 ? (
                  <EmptyState>Nenhum grupo cadastrado.</EmptyState>
                ) : (
                  data.groups.slice(0, 4).map((group) => (
                    <article className="admin-summary-row" key={group.id}>
                      <div>
                        <p className="mini-title">{group.title}</p>
                        <p className="mini-meta">{group.membersCount} membros</p>
                      </div>
                      <span className="status-badge">{group.status === "ACTIVE" ? "Ativo" : "Encerrado"}</span>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="card admin-panel">
              <div className="admin-panel-title">
                <h2>Fóruns</h2>
                <Button className="btn--small" onClick={() => navigate("/forum")}>
                  Ver Todos
                </Button>
              </div>
              <div className="list-divider">
                {data.topics.length === 0 ? (
                  <EmptyState>Nenhum tópico criado.</EmptyState>
                ) : (
                  data.topics.slice(0, 4).map((topic) => (
                    <article className="admin-summary-row" key={topic.id}>
                      <div>
                        <p className="mini-title">{topic.title}</p>
                        <div className="chip-list" style={{ marginTop: 10 }}>
                          {(topic.tags || []).map((tag) => (
                            <span className="chip" key={typeof tag === "string" ? tag : tag.name}>
                              {typeof tag === "string" ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mini-meta">
                        {topic.repliesCount ?? 0}
                        <br />
                        respostas
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="dashboard-grid">
          <section className="card dashboard-card">
            <h2>Grupos disponíveis</h2>
            <div className="list-divider">
              {data.groups.length === 0 ? (
                <EmptyState>Nenhum grupo disponível.</EmptyState>
              ) : (
                data.groups.slice(0, 5).map((group) => (
                  <article className="mini-row" key={group.id}>
                    <div>
                      <p className="mini-title">{group.title}</p>
                      <p className="mini-meta">{group.membersCount} membros</p>
                    </div>
                    <span className="status-badge">{group.status === "ACTIVE" ? "Ativo" : "Encerrado"}</span>
                  </article>
                ))
              )}
            </div>
            <Button className="full-button" onClick={() => navigate("/groups")}>
              Ver todos os grupos
            </Button>
          </section>

          <section className="card dashboard-card">
            <h2>Fórum Hoje</h2>
            <div className="list-divider">
              {data.topics.length === 0 ? (
                <EmptyState>Nenhum tópico criado ainda.</EmptyState>
              ) : (
                data.topics.map((topic) => (
                  <article className="forum-row" key={topic.id}>
                    <div>
                      <p className="mini-title">{topic.title}</p>
                      <div className="chip-list" style={{ marginTop: 10 }}>
                        {(topic.tags || []).map((tag) => (
                          <span className="chip" key={typeof tag === "string" ? tag : tag.name}>
                            {typeof tag === "string" ? tag : tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mini-meta">
                      {topic.repliesCount ?? 0}
                      <br />
                      respostas
                    </p>
                  </article>
                ))
              )}
            </div>
            <Button className="full-button" onClick={() => navigate("/forum")}>
              Ir para o Fórum
            </Button>
          </section>

          <section className="card dashboard-card">
            <h2>Mentores Disponíveis</h2>
            <div className="list-divider">
              {data.mentors.length === 0 ? (
                <EmptyState>Nenhum mentor cadastrado.</EmptyState>
              ) : (
                data.mentors.slice(0, 5).map((mentor) => (
                  <article className="mentor-home-item" key={mentor.id}>
                    <p className="mini-title">{mentor.name}</p>
                    <div className="chip-list" style={{ marginTop: 10 }}>
                      {mentor.tags.slice(0, 3).map((tag) => (
                        <span className="chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mentor-rating">
                      {mentor.hasRating ? `★ ${mentor.rating.toFixed(1)} / 5.0` : "Sem avaliações"}
                    </p>
                  </article>
                ))
              )}
            </div>
            <Button className="full-button" onClick={() => navigate("/mentors")}>
              Ver todos os mentores
            </Button>
          </section>
        </div>
      )}
    </Layout>
  );
}
