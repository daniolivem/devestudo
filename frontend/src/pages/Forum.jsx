import React, { useState, useEffect } from 'react';
import { ForumCard } from '../components/Forum/ForumCard';
import { currentUser } from '../utils/userMock';
import styles from './Forum.module.css';

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [userRole] = useState(currentUser.role);

  useEffect(() => {
    // Dados fiéis às tabelas do PI 1 (com Autor e Data)
    const mockData = [
      { 
        id: 1, 
        title: 'Como configurar o ambiente React com Vite?', 
        content: 'Estou tendo dificuldades na instalação das dependências do projeto integrador.',
        category: 'Frontend',
        author: 'Daniely Mélo',
        date: '25/04/2026'
      },
      { 
        id: 2, 
        title: 'Dúvida sobre Modelagem de Dados', 
        content: 'Quantas tabelas são necessárias para o módulo de mentoria no MySQL?',
        category: 'Backend',
        author: 'Antonio Nivaldo',
        date: '26/04/2026'
      },
      { 
        id: 3, 
        title: 'Documentação do Projeto', 
        content: 'Lembrete para a equipe revisar as referências bibliográficas do PDF.',
        category: 'Geral',
        author: 'Rilton Beserra',
        date: '27/04/2026'
      }
    ];
    setThreads(mockData);
  }, []);

  const handleReply = (id) => alert(`Abrindo editor de resposta para o tópico #${id}`);
  
  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este tópico?")) {
      setThreads(threads.filter(t => t.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fórum de Discussão</h1>
        <button className={styles.btnNewTopic}>+ Novo Tópico</button>
      </header>

      <div className={styles.stats}>
        Exibindo {threads.length} tópicos ativos na comunidade <strong>DevEstudo</strong>.
      </div>

      <section>
        {threads.map(thread => (
          <ForumCard 
            key={thread.id} 
            thread={thread} 
            userRole={userRole}
            onReply={handleReply}
            onDelete={handleDelete}
          />
        ))}
      </section>
    </div>
  );
}