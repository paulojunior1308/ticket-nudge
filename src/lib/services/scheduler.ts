import { sendEmail } from '@/services/emailService';

const API_URL = 'http://localhost:10000';

export const startReminderScheduler = () => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') return;

  // Agenda a verificação diária
  const checkInterval = 24 * 60 * 60 * 1000; // 24 horas
  setInterval(checkAndSendReminders, checkInterval);

  // Executa a primeira verificação imediatamente
  checkAndSendReminders();
};

const checkAndSendReminders = async () => {
  try {
    const response = await fetch(`${API_URL}/check-reminders`);
    if (!response.ok) {
      throw new Error('Erro ao verificar lembretes');
    }
    const data = await response.json();
    console.log('Lembretes enviados:', data.reminders);
  } catch (error) {
    console.error('Erro ao enviar lembretes:', error);
  }
};

// Função para executar verificação manual
export const runManualCheck = async () => {
  try {
    console.log('Iniciando verificação manual:', new Date().toLocaleString());
    const result = await checkAndSendReminders();
    console.log('Verificação manual concluída:', new Date().toLocaleString());
    return result;
  } catch (error) {
    console.error('Erro na verificação manual:', error);
    throw error;
  }
}; 