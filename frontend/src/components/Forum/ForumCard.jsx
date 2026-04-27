import React from 'react';
import styles from './Forum.module.css'; // CSS separado como ela pediu

export function ForumCard({ thread, userRole, onReply, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>{thread.category}</span>
        <h3 className={styles.title}>{thread.title}</h3>
      </div>
      
      <p className={styles.content}>{thread.content}</p>

      <div className={styles.actions}>
        {/* Aluno e Mentor podem responder */}
        {(userRole === 'STUDENT' || userRole === 'MENTOR') && (
          <button onClick={() => onReply(thread.id)} className={styles.btnReply}>
            Responder
          </button>
        )}

        {/* APENAS Admin pode excluir (Regra de Negócio) */}
        {userRole === 'ADMIN' && (
          <button onClick={() => onDelete(thread.id)} className={styles.btnDelete}>
            Excluir Tópico
          </button>
        )}
      </div>
    </div>
  );
}