import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startReminderScheduler } from '@/lib/services/scheduler'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Iniciar o agendador de lembretes
startReminderScheduler();
