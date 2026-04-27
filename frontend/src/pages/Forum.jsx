import React, { useState, useEffect } from 'react';
import { ForumCard } from '../components/Forum/ForumCard';
import { currentUser } from '../utils/userMock';

export default function Forum() {
  const [threads, setThreads] = useState([]); // Isso é um Hook (useState)
  const [userRole] = useState(currentUser.role);

  useEffect(() => { // Isso é um Hook (useEffect)
    setThreads([
      { id: 1, title: 'Dúvida Prisma', content: 'Setup inicial', category: 'Backend' },
      { id: 2, title: 'CSS Modules', content: 'Como usar?', category: 'Frontend' }
    ]);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Fórum Comunitário</h1>
      <p>Logado como: <strong>{userRole}</strong></p>
      {threads.map(t => (
        <ForumCard key={t.id} thread={t} userRole={userRole} onReply={(id) => alert(id)} onDelete={(id) => alert(id)} />
      ))}
    </div>
  );
}