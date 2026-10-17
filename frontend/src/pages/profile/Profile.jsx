import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const technologies = [
  "React",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "TypeScript",
  "Angular",
  "Vue",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Next.js",
  "Django",
  "Spring Boot",
  "PostgreSQL",
];

const checked = new Set(["React", "JavaScript", "Node.js"]);
const knowledgeLevels = ["Iniciante", "Intermediário", "Avançado"];

const mentorPreferenceDefaults = {
  mentor: {
    availability: "Noites e fins de semana",
    channel: "Google Meet ou Discord",
    format: "Sessões individuais de 45 minutos",
    instructions: "Envie sua principal dúvida e links do projeto antes da conversa.",
  },
  admin: {
    availability: "Tardes e noites",
    channel: "Google Meet",
    format: "Sessões individuais de 45 minutos",
    instructions: "Envie contexto, links e objetivo da conversa antes da sessão.",
  },
};

function MentorPreferencesSection({ role }) {
  const [preferences, setPreferences] = useState(mentorPreferenceDefaults[role] || mentorPreferenceDefaults.mentor);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setPreferences({
      availability: String(formData.get("availability") || "").trim(),
      channel: String(formData.get("channel") || "").trim(),
      format: String(formData.get("format") || "").trim(),
      instructions: String(formData.get("instructions") || "").trim(),
    });
    setIsSaved(true);
    setIsModalOpen(false);
  }

  return (
    <section className="card profile-section">
      <h2>Preferências das sessões</h2>
      <p className="page-subtitle">
        Estes dados aparecem para alunos quando eles solicitarem uma mentoria com você.
      </p>

      <div className="profile-section-actions">
        {isSaved && <span className="status-badge">Preferências salvas</span>}
        <Button className="btn--primary" onClick={() => setIsModalOpen(true)}>
          Editar preferências
        </Button>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsModalOpen(false)}>
          <section
            className="card modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-preferences-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="mentor-preferences-title">Preferências das sessões</h2>
                <p className="page-subtitle">Atualize os dados exibidos para alunos antes da mentoria.</p>
              </div>
            </div>

            <form className="mentor-preferences-form" onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="input-group">
                  <label>Disponibilidade</label>
                  <input
                    name="availability"
                    defaultValue={preferences.availability}
                    placeholder="Ex: Noites e fins de semana"
                  />
                </div>
                <div className="input-group">
                  <label>Canal da sessão</label>
                  <input name="channel" defaultValue={preferences.channel} placeholder="Ex: Google Meet, Discord" />
                </div>
              </div>

              <div className="input-group">
                <label>Formato</label>
                <input name="format" defaultValue={preferences.format} placeholder="Ex: Sessões de 45 minutos" />
              </div>

              <div className="input-group">
                <label>Orientações para o aluno</label>
                <textarea
                  name="instructions"
                  defaultValue={preferences.instructions}
                  placeholder="Explique o que o aluno deve enviar antes da sessão"
                  rows="5"
                />
              </div>

              <div className="modal-actions">
                <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button className="btn--primary" type="submit">
                  Salvar preferências
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function PasswordSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (newPassword.length < 6) {
      setMessage("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("A confirmação precisa ser igual à nova senha.");
      return;
    }

    setMessage("Senha alterada com sucesso.");
    setIsModalOpen(false);
  }

  return (
    <section className="card profile-section">
      <h2>Segurança</h2>
      <p className="page-subtitle">Atualize sua senha de acesso à plataforma.</p>

      <div className="profile-section-actions">
        {message && <span className="status-badge">{message}</span>}
        <Button className="btn--primary" onClick={() => setIsModalOpen(true)}>
          Trocar senha
        </Button>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsModalOpen(false)}>
          <section
            className="card modal-card modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="password-modal-title">Trocar senha</h2>
                <p className="page-subtitle">Informe sua senha atual e escolha uma nova senha.</p>
              </div>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Senha atual</label>
                <input name="currentPassword" type="password" placeholder="Digite sua senha atual" />
              </div>

              <div className="input-group">
                <label>Nova senha</label>
                <input name="newPassword" type="password" placeholder="Mínimo de 6 caracteres" />
              </div>

              <div className="input-group">
                <label>Confirmar nova senha</label>
                <input name="confirmPassword" type="password" placeholder="Repita a nova senha" />
              </div>

              <div className="modal-actions">
                <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button className="btn--primary" type="submit">
                  Salvar senha
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default function Profile() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const canManageMentorPreferences = role === "mentor" || role === "admin";

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Gerenciamento de Perfil</h1>
        <p className="page-subtitle">Atualize suas informações e preferências</p>
      </header>

      <div className="profile-form">
        <div className="profile-column">
          <section className="card profile-section">
            <h2>Informações Básicas</h2>
            <div className="stack">
              <Input label="Nome Completo" defaultValue="João Silva" />
              <Input label="E-mail" type="email" defaultValue="joao@exemplo.com" />
            </div>
          </section>

          <section className="card profile-section">
            <h2>Redes Sociais</h2>
            <div className="stack">
              <Input label="GitHub" defaultValue="joaosilva" />
              <Input label="LinkedIn" defaultValue="joao-silva" />
            </div>
          </section>

          <PasswordSection />
        </div>

        <div className="profile-column">
          <section className="card profile-section">
            <h2>Tecnologias de Interesse</h2>
            <p className="page-subtitle">Selecione as tecnologias que você estuda ou tem interesse</p>
            <div className="checkbox-grid">
              {technologies.map((technology) => (
                <label key={technology}>
                  <input type="checkbox" defaultChecked={checked.has(technology)} />
                  {technology}
                </label>
              ))}
            </div>
          </section>

          <section className="card profile-section">
            <h2>Nível de Conhecimento</h2>
            <p className="page-subtitle">Marque o nível que melhor representa seu momento atual</p>
            <div className="checkbox-grid checkbox-grid--compact">
              {knowledgeLevels.map((level) => (
                <label key={level}>
                  <input type="checkbox" name="knowledgeLevel" defaultChecked={level === "Intermediário"} />
                  {level}
                </label>
              ))}
            </div>
          </section>

          {canManageMentorPreferences && <MentorPreferencesSection role={role} />}
        </div>

        <div className="profile-actions">
          <Button className="btn--primary">
            Salvar Alterações
          </Button>
          <Button>Cancelar</Button>
        </div>
      </div>
    </Layout>
  );
}
