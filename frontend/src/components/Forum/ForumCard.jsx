import React from 'react';
import styles from './Forum.module.css'; // Isso conecta o CSS ao seu código

export function ForumCard({ thread, userRole, onReply, onDelete }) {
  return (
    <div className={styles.card}>
      <header>
        <span className={styles.tag}>{thread.category}</span>
        <h3 className={styles.title}>{thread.title}</h3>
      </header>
      
      <p className={styles.content}>{thread.content}</p>

      <div>
        {/* Lógica para Alunos e Mentores */}
        {(userRole === 'STUDENT' || userRole === 'MENTOR') && (
          <button onClick={() => onReply(thread.id)} className={styles.btnReply}>
            Responder
          </button>
        )}

        {/* Lógica exclusiva para o Administrador */}
        {userRole === 'ADMIN' && (
          <button onClick={() => onDelete(thread.id)} className={styles.btnDelete}>
            Excluir Tópico
          </button>
        )}
      </div>
    </div>
  );
}