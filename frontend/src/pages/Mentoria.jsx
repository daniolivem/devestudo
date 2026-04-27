import React, { useState, useEffect } from 'react';
import { MentoriaCard } from '../components/Forum/MentoriaCard';
import { currentUser } from '../utils/userMock';

export default function Mentoria() {
  const [mentors, setMentors] = useState([]);
  const [userRole] = useState(currentUser.role);

  useEffect(() => {
    // Simulação de dados (Mock)
    const mockMentors = [
      { id: 1, name: 'Ana Paula', specialty: 'React & UX', bio: 'Ajudo a transformar designs do Figma em código limpo.' },
      { id: 2, name: 'Carlos Eduardo', specialty: 'Node.js & Prisma', bio: 'Especialista em arquitetura de microsserviços e bancos de dados.' }
    ];
    setMentors(mockMentors);
  }, []);

  const handleRequest = (id) => alert(`Solicitação enviada ao mentor #${id}`);
  const handleEvaluate = (id) => alert(`Abrindo formulário de avaliação para mentor #${id}`);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Centro de Mentoria</h1>
        <p style={{ color: '#666' }}>Olá, {currentUser.name}. Seu acesso: <strong>{userRole}</strong></p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {mentors.map(mentor => (
          <MentoriaCard 
            key={mentor.id} 
            mentor={mentor} 
            userRole={userRole}
            onAction={handleRequest}
            onEvaluate={handleEvaluate}
          />
        ))}
      </div>
    </div>
  );
}