import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { startReminderScheduler } from '@/lib/services/scheduler'
import emailjs from '@emailjs/browser'

// Validação das variáveis de ambiente do EmailJS
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

if (!publicKey || !serviceId || !templateId) {
  console.error('Variáveis de ambiente do EmailJS não configuradas:', {
    publicKey: !!publicKey,
    serviceId: !!serviceId,
    templateId: !!templateId
  });
} else {
  // Inicializa o EmailJS com sua chave pública
  emailjs.init({
    publicKey,
    limitRate: {
      throttle: 2000 // Limita a 1 email a cada 2 segundos
    }
  });
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
