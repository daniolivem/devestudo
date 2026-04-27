import React from 'react';
import { currentUser } from '../utils/userMock';

export function Navbar() {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem', 
      background: '#000', 
      color: '#fff',
      alignItems: 'center'
    }}>
      <h2 style={{ margin: 0 }}>DevEstudo</h2>
      <div>
        <span style={{ marginRight: '1rem' }}>Fórum</span>
        <span style={{ marginRight: '1rem' }}>Mentoria</span>
      </div>
      <div style={{ fontSize: '0.8rem', borderLeft: '1px solid #444', paddingLeft: '1rem' }}>
        {currentUser.name} ({currentUser.role})
      </div>
    </nav>
  );
}