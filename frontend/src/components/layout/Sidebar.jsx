import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthSession();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const links = [
    { to: '/dashboard', label: 'Home' },
    ...(isAdmin ? [{ to: '/users', label: 'Usuários' }] : []),
    { to: '/forum', label: 'Fórum' },
    { to: '/groups', label: 'Grupos' },
    { to: '/mentors', label: 'Mentoria' },
    { to: '/profile', label: 'Perfil' },
  ];

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
    setIsMobileMenuOpen(false);
  }

  return (
    <aside className={isMobileMenuOpen ? 'sidebar sidebar--open' : 'sidebar'}>
      <div className="sidebar-header">
        <div className="brand">Comunidade<br />DevEstudo</div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        ><span /><span /><span /></button>
      </div>
      <nav className="sidebar-nav" id="main-navigation" aria-label="Navegação principal">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="logout-link" onClick={logout}>Sair</button>
    </aside>
  );
}
