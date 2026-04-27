import React from 'react'
import ReactDOM from 'react-dom/client'
import Mentoria from './pages/Mentoria' // Importamos a Mentoria

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Mentoria /> {/* Trocamos Forum por Mentoria aqui */}
  </React.StrictMode>
)