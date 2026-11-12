import { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import AdminGroupsPanel from "../../components/groups/AdminGroupsPanel";
import GroupCard from "../../components/groups/GroupCard";
import GroupFormModal from "../../components/groups/GroupFormModal";
import GroupRequestModal from "../../components/groups/GroupRequestModal";
import { useGroups } from "../../hooks/useGroups";
import { useAuthSession } from "../../hooks/useAuthSession";
import { GROUP_LEVELS } from "../../services/groupService";

const itemsPerPage = 10;

function GroupsFilterBar({ filters, onChange, onReset }) {
  return (
    <section className="card filter-bar groups-filter-bar" aria-label="Filtros de grupos">
      <div className="input-group">
        <label>Tecnologia</label>
        <input
          value={filters.technology}
          onChange={(e) => onChange("technology", e.target.value)}
          placeholder="React, Node.js, Python..."
        />
      </div>
      <div className="input-group">
        <label>Nível</label>
        <select value={filters.level} onChange={(e) => onChange("level", e.target.value)}>
          <option value="">Todos</option>
          {GROUP_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label>Disponibilidade</label>
        <input
          value={filters.availability}
          onChange={(e) => onChange("availability", e.target.value)}
          placeholder="Manhã, tarde, noite..."
        />
      </div>
      <div className="input-group groups-filter-action">
        <label>&nbsp;</label>
        <Button onClick={onReset}>Limpar filtros</Button>
      </div>
    </section>
  );
}

export default function Groups() {
  const { user, loading: sessionLoading } = useAuthSession();
  const isAdmin = user?.role === "ADMIN";
  const isMentor = user?.role === "MENTOR";
  const [requestedGroup, setRequestedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ technology: "", level: "", availability: "" });
  const {
    groups,
    loading,
    error,
    actionLoading,
    actionError,
    successMessage,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
  } = useGroups(filters);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleAdminGroups = groups.slice(startIndex, startIndex + itemsPerPage);

  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
    setCurrentPage(1);
  }

  function resetFilters() {
    setFilters({ technology: "", level: "", availability: "" });
    setCurrentPage(1);
  }

  async function handleSaveGroup(payload) {
    if (editingGroup?.id) {
      await updateGroup(editingGroup.id, payload);
    } else {
      await createGroup(payload);
    }

    setEditingGroup(null);
    setCurrentPage(1);
  }

  async function handleDeleteGroup(group) {
    if (!window.confirm(`Excluir o grupo "${group.title}"?`)) return;

    try {
      await deleteGroup(group.id);
      const nextTotalPages = Math.max(1, Math.ceil((groups.length - 1) / itemsPerPage));
      setCurrentPage((page) => Math.min(page, nextTotalPages));
    } catch {
      // actionError do hook já exibe a mensagem.
    }
  }

  async function handleRequestGroup(group) {
    try {
      await joinGroup(group.id);
      setRequestedGroup(group);
    } catch {
      // actionError do hook já exibe a mensagem.
    }
  }

  async function handleLeaveGroup(group) {
    if (!window.confirm(`Sair do grupo "${group.title}"?`)) return;

    try {
      await leaveGroup(group.id);
    } catch {
      // actionError do hook já exibe a mensagem.
    }
  }

  function handleEdit(group) {
    setEditingGroup(group);
  }

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!user) return <Navigate to="/" replace />;

  return (
    <Layout>
      <header className={isAdmin ? "page-header groups-admin-header" : "page-header"}>
        <div className="groups-user-header">
          <div>
            <h1 className="page-title">
              {isAdmin ? "Gestão de Grupos" : isMentor ? "Meus Grupos e Comunidades" : "Busca e Gestão de Grupos"}
            </h1>
            <p className="page-subtitle">
              {isAdmin
                ? "Gerencie grupos, dados de exibição e disponibilidade para os alunos."
                : isMentor
                  ? "Crie grupos, gerencie os seus e solicite entrada em outros grupos."
                  : "Encontre grupos de estudo e solicite sua participação."}
            </p>
          </div>
          {(isMentor || isAdmin) && (
            <Button className="btn--primary" onClick={() => setEditingGroup({})}>
              Criar grupo
            </Button>
          )}
        </div>
      </header>

      <GroupsFilterBar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />

      {successMessage && <p role="status">{successMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {error && <p role="alert">{error}</p>}

      {loading && groups.length === 0 ? (
        <p role="status">Carregando grupos…</p>
      ) : groups.length === 0 ? (
        <section className="card">
          <p className="modal-message">Nenhum grupo encontrado com os filtros informados.</p>
        </section>
      ) : isAdmin ? (
        <>
          <AdminGroupsPanel
            groups={visibleAdminGroups}
            onEdit={handleEdit}
            onDelete={handleDeleteGroup}
            busy={actionLoading}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={groups.length}
            itemsPerPage={itemsPerPage}
            itemLabel="grupos"
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="grid-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isMentor={isMentor}
              isAdmin={isAdmin}
              currentUserId={user.id}
              onEdit={handleEdit}
              onDelete={handleDeleteGroup}
              onRequest={handleRequestGroup}
              onLeave={handleLeaveGroup}
              busy={actionLoading}
            />
          ))}
        </div>
      )}

      {editingGroup && (
        <GroupFormModal
          group={editingGroup}
          title={editingGroup.id ? "Editar grupo" : "Criar grupo"}
          subtitle={
            isAdmin
              ? "Administradores podem gerenciar qualquer grupo."
              : "Mentores podem gerenciar apenas os grupos criados por eles."
          }
          onClose={() => setEditingGroup(null)}
          onSubmit={handleSaveGroup}
          error={actionError}
          loading={actionLoading}
        />
      )}

      <GroupRequestModal group={requestedGroup} onClose={() => setRequestedGroup(null)} />
    </Layout>
  );
}
