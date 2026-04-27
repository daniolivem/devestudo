import React, { useState, useEffect } from 'react';
import { MentoriaCard } from '../components/Forum/MentoriaCard';
import { currentUser } from '../utils/userMock';
import styles from './Mentoria.module.css';

export default function Mentoria() {
  const [mentors, setMentors] = useState([]);
  const [userRole] = useState(currentUser.role);

  useEffect(() => {
    // Dados simulando o banco de dados do Projeto DevEstudo
    const mockMentors = [
      { 
        id: 1, 
        name: 'Daniely Mélo', 
        specialty: 'React & Arquitetura', 
        bio: 'Especialista em desenvolvimento frontend e padrões de projeto.',
        availability: 'Segunda e Quarta'
      },
      { 
        id: 2, 
        name: 'Antonio Nivaldo', 
        specialty: 'Node.js & MySQL', 
        bio: 'Focado em infraestrutura de banco de dados e lógica de backend.',
        availability: 'Terça e Quinta'
      },
      { 
        id: 3, 
        name: 'Lucas Silveira', 
        specialty: 'UI/UX Design', 
        bio: 'Auxilio na prototipação e experiência do usuário no Figma.',
        availability: 'Sexta-feira'
      }
    ];
    setMentors(mockMentors);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Centro de Mentoria</h1>
        <p className={styles.subtitle}>Conecte-se com mentores da comunidade <strong>DevEstudo</strong>.</p>
      </header>

      <div className={styles.grid}>
        {mentors.map(mentor => (
          <MentoriaCard 
            key={mentor.id} 
            mentor={mentor} 
            userRole={userRole}
            onAction={(id) => alert(`Solicitação enviada para o mentor #${id}`)}
          />
        ))}
      </div>
    </div>
  );
}