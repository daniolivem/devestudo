import Button from "../ui/Button";

export default function GroupCard({ group, isMentor, isAdmin = false, currentUserId, onEdit, onDelete, onRequest, onLeave, busy = false }) {
  const isOwner = group.creatorId === currentUserId;
  const canManage = isAdmin || (isMentor && isOwner);
  const isMember = group.members.some(
    (member) => member.userId === currentUserId || member.user?.id === currentUserId,
  );

  return (
    <article className="card group-card">
      <div className="group-card-title-row">
        <h2>{group.title}</h2>
        {isOwner && <span className="status-badge">Criado por você</span>}
        {group.status === "CLOSED" && <span className="status-badge status-badge--blocked">Encerrado</span>}
      </div>
      <p className="group-meta">
        {group.membersCount} {group.membersCount === 1 ? "membro" : "membros"}
        <span style={{ margin: "0 12px" }}>•</span>
        {group.time}
      </p>
      {group.description && <p className="group-description">{group.description}</p>}
      {group.tags.length > 0 && (
        <div className="chip-list">
          {group.tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {group.materialsUrl && (
        <p className="mini-meta">
          <a href={group.materialsUrl} target="_blank" rel="noreferrer">
            Materiais do grupo
          </a>
        </p>
      )}
      {canManage ? (
        <div className="group-actions">
          <Button onClick={() => onEdit(group)} disabled={busy}>
            Editar
          </Button>
          <Button onClick={() => onDelete(group)} disabled={busy}>
            Excluir
          </Button>
        </div>
      ) : isMember ? (
        <Button className="full-button" onClick={() => onLeave(group)} disabled={busy}>
          {busy ? "Processando..." : "Sair do grupo"}
        </Button>
      ) : (
        <Button className="full-button" onClick={() => onRequest(group)} disabled={busy || group.status === "CLOSED"}>
          {busy ? "Processando..." : "Solicitar Entrada"}
        </Button>
      )}
    </article>
  );
}
