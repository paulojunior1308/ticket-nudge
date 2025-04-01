import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startReminderScheduler } from '@/lib/services/scheduler'
import emailjs from '@emailjs/browser'

// Inicializa o EmailJS com sua chave pública
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Inicia o agendador apenas no cliente
if (typeof window !== 'undefined') {
  startReminderScheduler();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
