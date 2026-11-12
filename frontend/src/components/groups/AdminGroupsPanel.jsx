import Button from "../ui/Button";

export default function AdminGroupsPanel({ groups, onEdit, onDelete, busy = false }) {
  return (
    <section className="card admin-groups-panel">
      <div className="admin-groups-head">
        <span>Grupo</span>
        <span>Membros</span>
        <span>Disponibilidade</span>
        <span>Ações</span>
      </div>

      <div className="list-divider">
        {groups.length === 0 ? (
          <p className="modal-message">Nenhum grupo cadastrado.</p>
        ) : (
          groups.map((group) => (
            <article className="admin-group-row" key={group.id}>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description || "Sem descrição."}</p>
                <div className="chip-list">
                  {group.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <strong>{group.membersCount}</strong>
              <span className="group-meta">{group.time}</span>
              <div className="admin-group-actions">
                <Button className="btn--small" onClick={() => onEdit(group)} disabled={busy}>
                  Editar
                </Button>
                <Button className="btn--small" onClick={() => onDelete(group)} disabled={busy}>
                  Excluir
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
