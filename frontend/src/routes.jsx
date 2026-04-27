import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Forum from './pages/Forum';
import Mentoria from './pages/Mentoria';
import { Sidebar } from './components/Sidebar';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* CORREÇÃO AQUI: Adicionado padding e largura dinâmica */}
        <main style={{ 
          flex: 1, 
          marginLeft: '260px', // Mesma largura da sua Sidebar
          padding: '20px',
          width: 'calc(100% - 260px)', 
          backgroundColor: '#f9fafb', 
          minHeight: '100vh' 
        }}>
          <Routes>
            <Route path="/" element={<Forum />} />
            <Route path="/mentoria" element={<Mentoria />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}