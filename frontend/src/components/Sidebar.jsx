import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { currentUser } from '../utils/userMock';

export function Sidebar() {
  const location = useLocation();

  return (
    <div className={styles.container}>
      <div className={styles.logo}>DevEstudo</div>
      
      <nav className={styles.nav}>
        <Link 
          to="/" 
          className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
        >
          🏠 Fórum
        </Link>
        <Link 
          to="/mentoria" 
          className={`${styles.link} ${location.pathname === '/mentoria' ? styles.active : ''}`}
        >
          🎓 Mentoria
        </Link>
      </nav>

      <div className={styles.userInfo}>
        <p><strong>{currentUser.name}</strong></p>
        <p style={{ color: '#9ca3af' }}>{currentUser.role}</p>
      </div>
    </div>
  );
}