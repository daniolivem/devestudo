import { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = searchParams.get("role");
  const query = role === "admin" || role === "mentor" ? `?role=${role}` : "";
  const links = [
    { to: `/dashboard${query}`, label: "Home" },
    ...(role === "admin" ? [{ to: `/users${query}`, label: "Usuários" }] : []),
    { to: `/forum${query}`, label: "Fórum" },
    { to: `/groups${query}`, label: "Grupos" },
    { to: `/mentors${query}`, label: "Mentoria" },
    { to: `/profile${query}`, label: "Perfil" },
  ];

  return (
    <aside className={isMobileMenuOpen ? "sidebar sidebar--open" : "sidebar"}>
      <div className="sidebar-header">
        <div className="brand">
          Comunidade
          <br />
          DevEstudo
        </div>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className="sidebar-nav" id="main-navigation" aria-label="Navegação principal">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/" className="logout-link" onClick={() => setIsMobileMenuOpen(false)}>
        Sair
      </NavLink>
    </aside>
  );
}
