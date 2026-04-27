import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Forum from './pages/Forum';
import Mentoria from './pages/Mentoria';
import { currentUser } from './utils/userMock';

// Este componente é a nossa Barra de Navegação Profissional
function Navbar() {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem', 
      background: '#000', 
      color: '#fff',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h2 style={{ margin: 0, color: '#60a5fa' }}>DevEstudo</h2>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Fórum</Link>
        <Link to="/mentoria" style={{ color: '#fff', textDecoration: 'none' }}>Mentoria</Link>
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
        {currentUser.name} | <span style={{ color: '#60a5fa' }}>{currentUser.role}</span>
      </div>
    </nav>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Forum />} />
        <Route path="/mentoria" element={<Mentoria />} />
      </Routes>
    </BrowserRouter>
  );
}