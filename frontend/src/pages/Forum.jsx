import React, { useState, useEffect } from 'react';
import { ForumCard } from '../components/Forum/ForumCard';
import { currentUser } from '../utils/userMock';

export default function Forum() {
  // HOOKS: Gerenciando a lista de tópicos e o papel do usuário
  const [threads, setThreads] = useState([]);
  const [userRole] = useState(currentUser.role);

  // useEffect: Simula a busca de dados quando a página carrega
  useEffect(() => {
    // Dados fictícios que serão substituídos pela API do Backend futuramente
    const mockThreads = [
      { 
        id: 1, 
        title: 'Dúvida sobre autenticação com Prisma', 
        content: 'Como posso validar o cargo do usuário no momento do login?', 
        category: 'Backend' 
      },
      { 
        id: 2, 
        title: 'Estilização com CSS Modules', 
        content: 'É melhor usar camelCase ou kebab-case nos nomes das classes?', 
        category: 'Frontend' 
      },
      { 
        id: 3, 
        title: 'Regras do Projeto Integrador', 
        content: 'Lembrete: todos os componentes devem ser reutilizáveis.', 
        category: 'Geral' 
      }
    ];
    
    setThreads(mockThreads);
  }, []);

  // Funções de Ação (Handlers)
  const handleReply = (id) => {
    alert(`Usuário ${currentUser.name} (${userRole}) clicou para responder ao tópico #${id}`);
  };

  const handleDelete = (id) => {
    if (userRole === 'ADMIN') {
      const filteredThreads = threads.filter(thread => thread.id !== id);
      setThreads(filteredThreads);
      alert('Tópico excluído com sucesso pelo Administrador.');
    } else {
      alert('Ação negada: Você não tem permissão para excluir.');
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh',
      fontFamily: 'sans-serif' 
    }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111' }}>Fórum de Estudos</h1>
        <p style={{ color: '#666' }}>
          Bem-vindo, <strong>{currentUser.name}</strong>. 
          Nível de acesso: <span style={{ color: '#2563eb' }}>{userRole}</span>
        </p>
      </header>
      
      <main style={{ maxWidth: '800px' }}>
        {threads.length > 0 ? (
          threads.map(thread => (
            <ForumCard 
              key={thread.id} 
              thread={thread} 
              userRole={userRole}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>Nenhum tópico encontrado no fórum.</p>
        )}
      </main>
    </div>
  );
}