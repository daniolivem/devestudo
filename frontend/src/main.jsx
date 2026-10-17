import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import './styles/auth.css'
import './styles/layout.css'
import './styles/dashboard.css'
import './styles/forum.css'
import './styles/groups.css'
import './styles/mentors.css'
import './styles/profile.css'
import './styles/users.css'
import './styles/responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
