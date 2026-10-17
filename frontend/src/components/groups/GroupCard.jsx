import Button from "../ui/Button";

export default function GroupCard({ group, isMentor, onEdit, onDelete, onRequest }) {
  return (
    <article className="card group-card">
      <div className="group-card-title-row">
        <h2>{group.title}</h2>
        {isMentor && group.createdByCurrentMentor && <span className="status-badge">Criado por você</span>}
      </div>
      <p className="group-meta">
        {group.members} membros <span style={{ margin: "0 12px" }}>•</span> {group.time}
      </p>
      <p className="group-description">{group.description}</p>
      <div className="chip-list">
        {group.tags.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      {isMentor && group.createdByCurrentMentor ? (
        <div className="group-actions">
          <Button onClick={() => onEdit(group)}>Editar</Button>
          <Button onClick={() => onDelete(group.title)}>Excluir</Button>
        </div>
      ) : (
        <Button className="full-button" onClick={() => onRequest(group)}>
          Solicitar Entrada
        </Button>
      )}
    </article>
  );
}
