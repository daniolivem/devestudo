import { useState } from "react";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import { initialUsers, userRoles } from "../../services/userService";

const usersPerPage = 10;

function UserFormModal({ user = {}, onClose, onSubmit }) {
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      id: user.id,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "STUDENT"),
      status: String(formData.get("status") || "Ativo"),
    };

    if (!payload.name || !payload.email) {
      return;
    }

    onSubmit(payload);
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="user-form-title">{user.id ? "Editar usuário" : "Adicionar usuário"}</h2>
            <p className="page-subtitle">Defina dados básicos, papel e status de acesso.</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="input-group">
              <label>Nome</label>
              <input name="name" defaultValue={user.name || ""} placeholder="Nome completo" />
            </div>
            <div className="input-group">
              <label>E-mail</label>
              <input name="email" type="email" defaultValue={user.email || ""} placeholder="email@exemplo.com" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Role</label>
              <select name="role" defaultValue={user.role || "STUDENT"}>
                {userRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select name="status" defaultValue={user.status || "Ativo"}>
                <option>Ativo</option>
                <option>Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <Button onClick={onClose}>Cancelar</Button>
            <Button className="btn--primary" type="submit">
              Salvar usuário
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * usersPerPage;
  const visibleUsers = users.slice(startIndex, startIndex + usersPerPage);

  function saveUser(userPayload) {
    setUsers((currentUsers) => {
      if (!userPayload.id) {
        return [{ ...userPayload, id: `user-${Date.now()}` }, ...currentUsers];
      }

      return currentUsers.map((user) => (user.id === userPayload.id ? userPayload : user));
    });
    setEditingUser(null);
    setCurrentPage(1);
  }

  function updateUserRole(userId, role) {
    setUsers((currentUsers) => currentUsers.map((user) => (user.id === userId ? { ...user, role } : user)));
  }

  function deleteUser(userId) {
    setUsers((currentUsers) => {
      const nextUsers = currentUsers.filter((user) => user.id !== userId);
      const nextTotalPages = Math.max(1, Math.ceil(nextUsers.length / usersPerPage));
      setCurrentPage((page) => Math.min(page, nextTotalPages));
      return nextUsers;
    });
  }

  return (
    <Layout>
      <header className="page-header users-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie contas, roles e status dos usuários da comunidade.</p>
        </div>
        <Button className="btn--primary" onClick={() => setEditingUser({})}>
          Adicionar usuário
        </Button>
      </header>

      <section className="card users-panel">
        <div className="users-table-head">
          <span>Usuário</span>
          <span>Role</span>
          <span>Status</span>
          <span>Ações</span>
        </div>

        <div className="list-divider">
          {visibleUsers.map((user) => (
            <article className="users-table-row" key={user.id}>
              <div className="user-identity">
                <span className="avatar" />
                <div>
                  <h2>{user.name}</h2>
                  <p className="mini-meta">{user.email}</p>
                </div>
              </div>

              <div className="input-group user-role-select">
                <label className="sr-only">Role de {user.name}</label>
                <select value={user.role} onChange={(e) => updateUserRole(user.id, e.target.value)}>
                  {userRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <span className={user.status === "Bloqueado" ? "status-badge status-badge--blocked" : "status-badge"}>
                {user.status}
              </span>

              <div className="users-actions">
                <Button className="btn--small" onClick={() => setEditingUser(user)}>
                  Editar
                </Button>
                <Button className="btn--small btn--danger" onClick={() => deleteUser(user.id)}>
                  Deletar
                </Button>
              </div>
            </article>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          itemsPerPage={usersPerPage}
          itemLabel="usuários"
          onPageChange={setCurrentPage}
        />
      </section>

      {editingUser && <UserFormModal user={editingUser} onClose={() => setEditingUser(null)} onSubmit={saveUser} />}
    </Layout>
  );
}
