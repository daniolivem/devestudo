import React from 'react';
import styles from './Mentoria.module.css';

export function MentoriaCard({ mentor, userRole, onAction }) {
  return (
    <div className={styles.card}>
      <div className={styles.statusBadge}>Disponível</div>
      <div className={styles.avatarPlaceholder}>
        {mentor.name.charAt(0)}
      </div>
      <h3 className={styles.name}>{mentor.name}</h3>
      <span className={styles.specialty}>{mentor.specialty}</span>
      <p className={styles.bio}>{mentor.bio}</p>
      
      <div className={styles.footer}>
        <div className={styles.infoRow}>
          <span>📅 {mentor.availability}</span>
        </div>
        
        {userRole === 'STUDENT' ? (
          <button onClick={() => onAction(mentor.id)} className={styles.primaryButton}>
            Solicitar Mentoria
          </button>
        ) : (
          <button className={styles.secondaryButton}>Ver Perfil</button>
        )}
      </div>
    </div>
  );
}