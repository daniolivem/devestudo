import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleAdminLogin(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError('');
    try {
      const { data } = await api.post('/auth/login', {
        email: form.get('email'),
        password: form.get('password'),
      });
      if (data.user.role !== 'ADMIN') {
        setError('Esta conta não possui acesso administrativo.');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível entrar.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login Administrativo</h1>
        <p className="auth-subtitle">Acesse o painel de gestão da Comunidade DevEstudo</p>
        <form className="auth-form" onSubmit={handleAdminLogin}>
          {error && <p role="alert">{error}</p>}
          <div className="input-group">
            <label>E-mail administrativo</label>
            <input name="email" type="email" placeholder="admin@devestudo.com" required />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input name="password" type="password" placeholder="••••••••" required />
          </div>
          <button className="btn btn--primary" type="submit">Entrar</button>
        </form>
        <div className="auth-actions auth-actions--center">
          <Link to="/">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
