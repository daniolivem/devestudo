import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import { useAuthSession } from "../../hooks/useAuthSession";
import * as userService from "../../services/userService";

const usersPerPage = 10;

function UserFormModal({ user = {}, currentUserId, onClose, onSubmit, error = "", loading = false }) {
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(user.id);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "STUDENT"),
      isBlocked: String(formData.get("status") || "Ativo") === "Bloqueado",
    };
    const password = String(formData.get("password") || "");

    if (!payload.name) {
      setLocalError("Informe o nome do usuário.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setLocalError("Informe um e-mail válido.");
      return;
    }

    if (!isEditing) {
      if (password.length < 8) {
        setLocalError("A senha deve ter no mínimo 8 caracteres.");
        return;
      }

      if (!/\d/.test(password)) {
        setLocalError("A senha deve conter pelo menos um número.");
        return;
      }

      if (/\s/.test(password)) {
        setLocalError("A senha não deve conter espaços.");
        return;
      }

      payload.password = password;
    }

    if (user.id === currentUserId && (payload.role !== "ADMIN" || payload.isBlocked)) {
      setLocalError("Você não pode remover seu próprio acesso de administrador nem bloquear a própria conta.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(payload);
    } catch {
      // O erro da API é exibido pela página.
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = loading || submitting;

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
            <h2 id="user-form-title">{isEditing ? "Editar usuário" : "Adicionar usuário"}</h2>
            <p className="page-subtitle">Defina dados básicos, papel e status de acesso.</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="input-group">
              <label>Nome *</label>
              <input name="name" defaultValue={user.name || ""} placeholder="Nome completo" maxLength={120} required />
            </div>
            <div className="input-group">
              <label>E-mail *</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email || ""}
                placeholder="email@exemplo.com"
                maxLength={160}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Role</label>
              <select name="role" defaultValue={user.role || "STUDENT"}>
                {userService.userRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select name="status" defaultValue={user.isBlocked ? "Bloqueado" : "Ativo"}>
                <option>Ativo</option>
                <option>Bloqueado</option>
              </select>
            </div>
          </div>

          {!isEditing && (
            <div className="input-group">
              <label>Senha inicial *</label>
              <input name="password" type="password" placeholder="Mínimo 8 caracteres, com número" required />
            </div>
          )}

          {(localError || error) && <p role="alert">{localError || error}</p>}

          <div className="modal-actions">
            <Button onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
            <Button className="btn--primary" type="submit" disabled={isBusy}>
              {isBusy ? "Salvando..." : "Salvar usuário"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Users() {
  const { user: sessionUser, loading: sessionLoading } = useAuthSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await userService.listUsers());
    } catch (err) {
      setError(userService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionUser?.role !== "ADMIN") return;

    const request = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(request);
  }, [load, sessionUser?.role]);

  async function runAction(action, successText) {
    setActionLoading(true);
    setActionError("");
    setSuccessMessage("");

    try {
      await action();
      await load();
      setSuccessMessage(successText);
      return true;
    } catch (err) {
      setActionError(userService.getErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSave(payload) {
    const success = await runAction(
      () =>
        editingUser?.id
          ? userService.updateUser(editingUser.id, {
              name: payload.name,
              email: payload.email,
              role: payload.role,
              isBlocked: payload.isBlocked,
            })
          : userService.createUser(payload),
      editingUser?.id ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.",
    );

    if (success) {
      setEditingUser(null);
      setCurrentPage(1);
    }
  }

  async function handleRoleChange(user, role) {
    await runAction(
      () => userService.updateUser(user.id, { role }),
      "Role atualizada com sucesso.",
    );
  }

  async function handleDelete(user) {
    if (!window.confirm(`Excluir o usuário "${user.name}"?`)) return;

    await runAction(
      () => userService.deleteUser(user.id),
      "Usuário removido com sucesso.",
    );

    setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((users.length - 1) / usersPerPage))));
  }

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!sessionUser) return <Navigate to="/" replace />;
  if (sessionUser.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  const startIndex = (currentPage - 1) * usersPerPage;
  const visibleUsers = users.slice(startIndex, startIndex + usersPerPage);

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

      {successMessage && <p role="status">{successMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {error && <p role="alert">{error}</p>}

      <section className="card users-panel">
        <div className="users-table-head">
          <span>Usuário</span>
          <span>Role</span>
          <span>Status</span>
          <span>Ações</span>
        </div>

        {loading ? (
          <p role="status">Carregando usuários…</p>
        ) : users.length === 0 ? (
          <p className="modal-message">Nenhum usuário cadastrado.</p>
        ) : (
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
                  <select
                    value={user.role}
                    disabled={actionLoading}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                  >
                    {userService.userRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <span className={user.isBlocked ? "status-badge status-badge--blocked" : "status-badge"}>
                  {user.status}
                </span>

                <div className="users-actions">
                  <Button className="btn--small" onClick={() => setEditingUser(user)} disabled={actionLoading}>
                    Editar
                  </Button>
                  <Button
                    className="btn--small btn--danger"
                    onClick={() => handleDelete(user)}
                    disabled={actionLoading || user.id === sessionUser.id}
                  >
                    Deletar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          itemsPerPage={usersPerPage}
          itemLabel="usuários"
          onPageChange={setCurrentPage}
        />
      </section>

      {editingUser && (
        <UserFormModal
          user={editingUser}
          currentUserId={sessionUser.id}
          onClose={() => {
            setEditingUser(null);
            setActionError("");
          }}
          onSubmit={handleSave}
          error={actionError}
          loading={actionLoading}
        />
      )}
    </Layout>
  );
}
