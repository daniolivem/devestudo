import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import { useAuthSession } from "../../hooks/useAuthSession";
import api from "../../services/api";

const technologies = [
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "Java",
  "Spring Boot",
  "SQL",
  "HTML/CSS",
  "TypeScript",
  "Docker",
  "AWS",
  "Git",
];

const knowledgeLevels = ["Iniciante", "Intermediário", "Avançado"];
const availabilities = ["Seg-Sex manhã", "Seg-Sex tarde", "Seg-Sex noite", "Fim de semana", "Flexível"];

function isValidUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function MentorPreferencesSection({ profile, onSaved }) {
  const [mentorTechnologies, setMentorTechnologies] = useState(profile.mentorTechnologies || []);
  const [calendlyUrl, setCalendlyUrl] = useState(profile.calendlyUrl || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleTechnology(technology) {
    setMentorTechnologies((current) => {
      if (current.includes(technology)) {
        return current.filter((item) => item !== technology);
      }

      if (current.length >= 3) {
        setError("Selecione no máximo 3 tecnologias.");
        return current;
      }

      setError("");
      return [...current, technology];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mentorTechnologies.length === 0) {
      setError("Selecione pelo menos uma tecnologia.");
      return;
    }

    if (!isValidUrl(calendlyUrl)) {
      setError("Informe uma URL http(s) válida para o agendamento.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.put("/mentors/profile", {
        mentorTechnologies,
        calendlyUrl: calendlyUrl || null,
      });
      setSuccess("Preferências de mentor salvas com sucesso.");
      onSaved?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível salvar as preferências.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card profile-section">
      <h2>Preferências das sessões</h2>
      <p className="page-subtitle">Estes dados aparecem para alunos quando eles solicitarem uma mentoria com você.</p>

      <form className="mentor-preferences-form" onSubmit={handleSubmit}>
        <fieldset className="tag-fieldset">
          <legend>Tecnologias que você mentoriza (máximo 3)</legend>
          <div className="tag-options">
            {technologies.map((technology) => (
              <label className="tag-option" key={technology}>
                <input
                  type="checkbox"
                  checked={mentorTechnologies.includes(technology)}
                  onChange={() => toggleTechnology(technology)}
                />
                <span>{technology}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="input-group">
          <label>Link de agendamento (Calendly)</label>
          <input
            value={calendlyUrl}
            onChange={(e) => setCalendlyUrl(e.target.value)}
            placeholder="https://calendly.com/seu-usuario"
            maxLength={255}
          />
        </div>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <div className="modal-actions">
          <Button className="btn--primary" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar preferências"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!currentPassword || !newPassword) {
      setError("Informe a senha atual e a nova senha.");
      return;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("A nova senha deve conter pelo menos um número.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação precisa ser igual à nova senha.");
      return;
    }

    setLoading(true);

    try {
      await api.put("/profile/password", { currentPassword, newPassword });
      setMessage("Senha alterada com sucesso.");
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
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
                <label>Senha atual *</label>
                <input name="currentPassword" type="password" placeholder="Digite sua senha atual" required />
              </div>

              <div className="input-group">
                <label>Nova senha *</label>
                <input name="newPassword" type="password" placeholder="Mínimo de 8 caracteres, com número" required />
              </div>

              <div className="input-group">
                <label>Confirmar nova senha *</label>
                <input name="confirmPassword" type="password" placeholder="Repita a nova senha" required />
              </div>

              {error && <p role="alert">{error}</p>}

              <div className="modal-actions">
                <Button onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button className="btn--primary" type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar senha"}
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
  const { user, loading: sessionLoading } = useAuthSession();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", photo: "", socialNetwork: "", knowledgeLevel: "", interests: [], availability: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/profile");

        if (!active) return;

        const loadedProfile = data.user;
        setProfile(loadedProfile);
        setForm({
          name: loadedProfile.name || "",
          photo: loadedProfile.photo || "",
          socialNetwork: loadedProfile.socialNetwork || "",
          knowledgeLevel: loadedProfile.knowledgeLevel || "",
          interests: loadedProfile.interests || [],
          availability: loadedProfile.availability || "",
        });
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Não foi possível carregar o perfil.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  function toggleInterest(technology) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(technology)
        ? current.interests.filter((item) => item !== technology)
        : [...current.interests, technology],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Informe seu nome.");
      return;
    }

    if (!isValidUrl(form.photo)) {
      setError("A foto deve ser uma URL http(s) válida.");
      return;
    }

    if (!isValidUrl(form.socialNetwork)) {
      setError("A rede social deve ser uma URL http(s) válida.");
      return;
    }

    setSaving(true);

    try {
      const { data } = await api.put("/profile", {
        name: form.name.trim(),
        interests: form.interests,
        ...(form.photo ? { photo: form.photo } : {}),
        ...(form.socialNetwork ? { socialNetwork: form.socialNetwork } : {}),
        ...(form.knowledgeLevel ? { knowledgeLevel: form.knowledgeLevel } : {}),
        ...(form.availability ? { availability: form.availability } : {}),
      });

      setProfile(data.user);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!user) return <Navigate to="/" replace />;
  if (loading && !profile) return <Layout><p role="status">Carregando perfil…</p></Layout>;

  return (
    <Layout>
      <header className="page-header">
        <h1 className="page-title">Gerenciamento de Perfil</h1>
        <p className="page-subtitle">Atualize suas informações e preferências</p>
      </header>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-column">
          <section className="card profile-section">
            <h2>Informações Básicas</h2>
            <div className="stack">
              <div className="input-group">
                <label>Nome Completo *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  maxLength={120}
                  required
                />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input value={profile?.email || user.email || ""} readOnly disabled />
              </div>
              <div className="input-group">
                <label>URL da foto</label>
                <input
                  value={form.photo}
                  onChange={(e) => setForm((current) => ({ ...current, photo: e.target.value }))}
                  placeholder="https://..."
                  maxLength={255}
                />
              </div>
            </div>
          </section>

          <section className="card profile-section">
            <h2>Redes Sociais</h2>
            <div className="stack">
              <div className="input-group">
                <label>Rede social (URL)</label>
                <input
                  value={form.socialNetwork}
                  onChange={(e) => setForm((current) => ({ ...current, socialNetwork: e.target.value }))}
                  placeholder="https://github.com/seu-usuario"
                  maxLength={255}
                />
              </div>
            </div>
          </section>

          <section className="card profile-section">
            <h2>Disponibilidade</h2>
            <div className="input-group">
              <label>Melhor horário para estudar</label>
              <select
                value={form.availability}
                onChange={(e) => setForm((current) => ({ ...current, availability: e.target.value }))}
              >
                <option value="">Não informada</option>
                {availabilities.map((availability) => (
                  <option key={availability} value={availability}>
                    {availability}
                  </option>
                ))}
              </select>
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
                  <input
                    type="checkbox"
                    checked={form.interests.includes(technology)}
                    onChange={() => toggleInterest(technology)}
                  />
                  {technology}
                </label>
              ))}
            </div>
          </section>

          <section className="card profile-section">
            <h2>Nível de Conhecimento</h2>
            <p className="page-subtitle">Marque o nível que melhor representa seu momento atual</p>
            <div className="input-group">
              <label>Nível</label>
              <select
                value={form.knowledgeLevel}
                onChange={(e) => setForm((current) => ({ ...current, knowledgeLevel: e.target.value }))}
              >
                <option value="">Não informado</option>
                {knowledgeLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {user.role === "MENTOR" && profile && (
            <MentorPreferencesSection
              profile={profile}
              onSaved={(updated) => setProfile((current) => ({ ...current, ...updated }))}
            />
          )}
        </div>

        <div className="profile-actions">
          <Button className="btn--primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Layout>
  );
}
