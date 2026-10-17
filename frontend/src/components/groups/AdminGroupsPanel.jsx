import Button from "../ui/Button";

export default function AdminGroupsPanel({ groups, onEdit, onDelete }) {
  return (
    <section className="card admin-groups-panel">
      <div className="admin-groups-head">
        <span>Grupo</span>
        <span>Membros</span>
        <span>Disponibilidade</span>
        <span>Ações</span>
      </div>

      <div className="list-divider">
        {groups.map((group) => (
          <article className="admin-group-row" key={group.title}>
            <div>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div className="chip-list">
                {group.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <strong>{group.members}</strong>
            <span className="group-meta">{group.time}</span>
            <div className="admin-group-actions">
              <Button className="btn--small" onClick={() => onEdit(group)}>
                Editar
              </Button>
              <Button className="btn--small" onClick={() => onDelete(group.title)}>
                Excluir
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
