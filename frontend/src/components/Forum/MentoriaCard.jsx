import React from 'react';
import styles from './Mentoria.module.css';

export function MentoriaCard({ mentor, userRole, onAction, onEvaluate }) {
  return (
    <div className={styles.card}>
      <span className={styles.specialty}>{mentor.specialty}</span>
      <h3 className={styles.mentorName}>{mentor.name}</h3>
      <p className={styles.description}>{mentor.bio}</p>

      <div className={styles.footer}>
        {/* Alunos solicitam, Mentores gerenciam */}
        {userRole === 'STUDENT' ? (
          <>
            <button onClick={() => onAction(mentor.id)} className={styles.btnPrimary}>
              Solicitar Mentoria
            </button>
            <button onClick={() => onEvaluate(mentor.id)} className={styles.btnSecondary}>
              Avaliar Mentor
            </button>
          </>
        ) : (
          <button className={styles.btnPrimary}>Ver Minha Agenda</button>
        )}
      </div>
    </div>
  );
}