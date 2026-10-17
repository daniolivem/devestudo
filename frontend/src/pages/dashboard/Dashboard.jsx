import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import { getRoleLabel, initialUsers } from "../../services/userService";

const groups = [
  { name: "React Avançado", members: "12 membros", status: "Ativo" },
  { name: "JavaScript Fundamentals", members: "8 membros", status: "Pendente" },
  { name: "Node.js API Development", members: "15 membros", status: "Ativo" },
];

const topics = [
  { title: "Como implementar hooks personalizados em React?", tags: ["React", "JavaScript"], replies: 23 },
  { title: "Diferença entre var, let e const", tags: ["JavaScript"], replies: 45 },
  { title: "Boas práticas com async/await", tags: ["JavaScript", "Node.js"], replies: 18 },
  { title: "Redux vs Context API: quando usar?", tags: ["React"], replies: 31 },
  { title: "Configurando TypeScript no Node.js", tags: ["Node.js"], replies: 12 },
];

const mentors = [
  { name: "Ana Costa", tags: ["React", "TypeScript", "Next.js"], rating: "4.8 / 5.0" },
  { name: "Carlos Mendes", tags: ["Node.js", "PostgreSQL", "Docker"], rating: "4.9 / 5.0" },
  { name: "Beatriz Lima", tags: ["JavaScript", "React", "AWS"], rating: "4.7 / 5.0" },
];

const adminStats = [
  { label: "Tópicos em Fóruns", value: "1,320" },
  { label: "Total de Usuários", value: "8,250" },
  { label: "Grupos Ativos", value: "540" },
];

const adminGroups = [
  { name: "React Avançado", members: "18 membros", status: "Ativo" },
  { name: "JavaScript Fundamentals", members: "24 membros", status: "Ativo" },
  { name: "Node.js API Development", members: "15 membros", status: "Pendente" },
  { name: "Python para Data Science", members: "22 membros", status: "Ativo" },
];

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Dashboard Administrativo</h1>
        <p className="page-subtitle">Acompanhe usuários, grupos e fóruns da comunidade</p>
      </header>

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
            <h2>Novos Usuários</h2>
            <Button className="btn--small" onClick={() => navigate("/users?role=admin")}>
              Ver Todos
            </Button>
          </div>
          <div className="list-divider">
            {initialUsers.slice(0, 5).map((user) => (
              <article className="user-row" key={user.id}>
                <span className="avatar" />
                <div>
                  <p>{user.name}</p>
                  <span className="role-pill">{getRoleLabel(user.role)}</span>
                </div>
                <span>Há 2 horas</span>
              </article>
            ))}
          </div>
          <div className="card admin-stats">
            <h3>Estatísticas dos Grupos</h3>
            <p>Grupos Ativos: <strong>540</strong></p>
            <p>Discussões: <strong>2,430</strong></p>
            <p>Membros Online: <strong>865</strong></p>
          </div>
        </section>

        <section className="card admin-panel">
          <div className="admin-panel-title">
            <h2>Grupos</h2>
            <Button className="btn--small" onClick={() => navigate("/groups?role=admin")}>
              Ver Todos
            </Button>
          </div>
          <div className="list-divider">
            {adminGroups.map((group) => (
              <article className="admin-summary-row" key={group.name}>
                <div>
                  <p className="mini-title">{group.name}</p>
                  <p className="mini-meta">{group.members}</p>
                </div>
                <span className="status-badge">{group.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card admin-panel">
          <div className="admin-panel-title">
            <h2>Fóruns</h2>
            <Button className="btn--small" onClick={() => navigate("/forum?role=admin")}>
              Ver Todos
            </Button>
          </div>
          <div className="list-divider">
            {topics.slice(0, 4).map((topic) => (
              <article className="admin-summary-row" key={topic.title}>
                <div>
                  <p className="mini-title">{topic.title}</p>
                  <div className="chip-list" style={{ marginTop: 10 }}>
                    {topic.tags.map((tag) => (
                      <span className="chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mini-meta">
                  {topic.replies}
                  <br />
                  respostas
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const roleQuery = role === "mentor" ? "?role=mentor" : "";

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Bem-vindo(a), João Silva</h1>
        <p className="page-subtitle">Confira suas atividades e recomendações personalizadas</p>
      </header>

      <div className="dashboard-grid">
        <section className="card dashboard-card">
          <h2>Meus Grupos</h2>
          <div className="list-divider">
            {groups.map((group) => (
              <article className="mini-row" key={group.name}>
                <div>
                  <p className="mini-title">{group.name}</p>
                  <p className="mini-meta">{group.members}</p>
                </div>
                <span className="status-badge">{group.status}</span>
              </article>
            ))}
          </div>
          <Button className="full-button" onClick={() => navigate(`/groups${roleQuery}`)}>
            Ver todos os grupos
          </Button>
        </section>

        <section className="card dashboard-card">
          <h2>Fórum Hoje</h2>
          <div className="list-divider">
            {topics.map((topic) => (
              <article className="forum-row" key={topic.title}>
                <div>
                  <p className="mini-title">{topic.title}</p>
                  <div className="chip-list" style={{ marginTop: 10 }}>
                    {topic.tags.map((tag) => (
                      <span className="chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mini-meta">
                  {topic.replies}
                  <br />
                  respostas
                </p>
              </article>
            ))}
          </div>
          <Button className="full-button" onClick={() => navigate(`/forum${roleQuery}`)}>
            Ir para o Fórum
          </Button>
        </section>

        <section className="card dashboard-card">
          <h2>Mentores Disponíveis</h2>
          <div className="list-divider">
            {mentors.map((mentor) => (
              <article className="mentor-home-item" key={mentor.name}>
                <p className="mini-title">{mentor.name}</p>
                <div className="chip-list" style={{ marginTop: 10 }}>
                  {mentor.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mentor-rating">★ {mentor.rating}</p>
              </article>
            ))}
          </div>
          <Button className="full-button" onClick={() => navigate(`/mentors${roleQuery}`)}>
            Ver todos os mentores
          </Button>
        </section>
      </div>
    </Layout>
  );
}
