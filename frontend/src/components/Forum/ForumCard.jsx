import React from 'react';
import styles from './Forum.module.css';

export function ForumCard({ thread, userRole, onReply, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.categoryTag}>{thread.category}</span>
        <span className={styles.date}>{thread.date}</span>
      </div>
      
      <h3 className={styles.title}>{thread.title}</h3>
      <p className={styles.author}>Postado por: <strong>{thread.author}</strong></p>
      
      <p className={styles.content}>{thread.content}</p>

      <div className={styles.actions}>
        <button onClick={() => onReply(thread.id)} className={styles.btnReply}>
          💬 Responder
        </button>
        {userRole === 'ADMIN' && (
          <button onClick={() => onDelete(thread.id)} className={styles.btnDelete}>
            🗑️ Excluir
          </button>
        )}
      </div>
    </div>
  );
}