import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
      role: String(formData.get("role") || "STUDENT"),
    };

    if (!payload.name) {
      setError("Informe seu nome.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (payload.password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (!/\d/.test(payload.password)) {
      setError("A senha deve conter pelo menos um número.");
      return;
    }

    if (/\s/.test(payload.password)) {
      setError("A senha não deve conter espaços.");
      return;
    }

    if (payload.password !== payload.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", payload);
      navigate("/", { replace: true, state: { message: "Conta criada com sucesso! Faça login para continuar." } });
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Criar Conta</h1>
        <p className="auth-subtitle">Preencha os dados do novo usuário</p>

        <form className="auth-form" onSubmit={handleRegister}>
          {error && <p role="alert">{error}</p>}

          <div className="input-group">
            <label>Nome *</label>
            <input name="name" placeholder="Nome completo" maxLength={120} required />
          </div>

          <div className="input-group">
            <label>E-mail *</label>
            <input name="email" type="email" placeholder="seu@email.com" maxLength={160} required />
          </div>

          <div className="input-group">
            <label>Tipo de conta</label>
            <select name="role" defaultValue="STUDENT">
              <option value="STUDENT">Aluno</option>
              <option value="MENTOR">Mentor</option>
            </select>
          </div>

          <div className="input-group">
            <label>Senha *</label>
            <input name="password" type="password" placeholder="Mínimo 8 caracteres, com número" required />
          </div>

          <div className="input-group">
            <label>Confirmar senha *</label>
            <input name="confirmPassword" type="password" placeholder="Repita a senha" required />
          </div>

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="auth-actions auth-actions--center">
          <Link to="/">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
