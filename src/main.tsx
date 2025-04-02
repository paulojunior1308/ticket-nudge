import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startReminderScheduler } from '@/lib/services/scheduler'
import emailjs from '@emailjs/browser'

// Validação das variáveis de ambiente do EmailJS
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
if (!publicKey) {
  console.error('VITE_EMAILJS_PUBLIC_KEY não está configurada');
} else {
  // Inicializa o EmailJS com sua chave pública
  emailjs.init(publicKey);
  console.log('EmailJS inicializado com sucesso');
}

// Inicia o agendador apenas no cliente
if (typeof window !== 'undefined') {
  startReminderScheduler();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
