import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email: formData.get("email"), password: formData.get("password") });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "ADMIN" ? "/dashboard?role=admin" : data.user.role === "MENTOR" ? "/dashboard?role=mentor" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Não foi possível entrar.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Comunidade DevEstudo</h1>
        <p className="auth-subtitle">Faça login para continuar</p>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && <p role="alert">{error}</p>}
          <div className="input-group">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="seu@email.com" required />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>

          <button className="btn btn--primary" type="submit">
            Entrar
          </button>
        </form>

        <div className="auth-actions">
          <Link to="/forgot-password">Esqueci minha senha</Link>
          <Link to="/register">Criar conta</Link>
        </div>

        <Link className="admin-link" to="/admin-login">
          Login Administrativo
        </Link>
      </div>
    </div>
  );
}
