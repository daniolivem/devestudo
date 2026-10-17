import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  function handleAdminLogin(e) {
    e.preventDefault();
    navigate("/dashboard?role=admin");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login Administrativo</h1>
        <p className="auth-subtitle">Acesse o painel de gestão da Comunidade DevEstudo</p>

        <form className="auth-form" onSubmit={handleAdminLogin}>
          <div className="input-group">
            <label>E-mail administrativo</label>
            <input type="email" placeholder="admin@devestudo.com" />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button className="btn btn--primary" type="submit">
            Entrar como Admin
          </button>
        </form>

        <div className="auth-actions auth-actions--center">
          <Link to="/">Voltar ao login de aluno</Link>
        </div>
      </div>
    </div>
  );
}
