import emailjs from '@emailjs/browser';
import { Ticket } from '@/types';
import { getTickets } from './firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para obter as variáveis de ambiente de forma segura
const getEnvVar = (key: string): string => {
  // Tenta obter do import.meta.env (cliente)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  // Tenta obter do process.env (servidor)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

// Inicializa o EmailJS
console.log('Configurando EmailJS...');
emailjs.init(getEnvVar('VITE_EMAILJS_PUBLIC_KEY'));

// Função para testar a conexão
export const testConnection = async () => {
  try {
    console.log('Iniciando teste de conexão com o EmailJS...');
    
    const templateParams = {
      to_email: 'pauloesjr2@gmail.com',
      subject: 'Teste de Conexão EmailJS',
      message: `
        <h2>Teste de Conexão</h2>
        <p>Este é um teste de conexão com o EmailJS.</p>
        <p>Se você está recebendo este email, a conexão está funcionando corretamente.</p>
      `
    };

    console.log('Parâmetros do template:', templateParams);
    console.log('Service ID:', getEnvVar('VITE_EMAILJS_SERVICE_ID'));
    console.log('Template ID:', getEnvVar('VITE_EMAILJS_TEMPLATE_ID'));

    await emailjs.send(
      getEnvVar('VITE_EMAILJS_SERVICE_ID'),
      getEnvVar('VITE_EMAILJS_TEMPLATE_ID'),
      templateParams
    );

    console.log('Conexão com o EmailJS estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro detalhado ao conectar com o EmailJS:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log('Tentando enviar email para:', to);
    console.log('Assunto:', subject);
    
    const templateParams = {
      name: to.split('@')[0],
      email: to,
      title: subject,
      message: html,
      time: new Date().toLocaleString('pt-BR'),
      reply_to: 'nti.pompeia@sescsp.org.br',
      from_name: "Suporte TI - SESC Pompeia",
      from_email: 'nti.pompeia@sescsp.org.br'
    };

    console.log('Parâmetros do template:', templateParams);
    console.log('Service ID:', getEnvVar('VITE_EMAILJS_SERVICE_ID'));
    console.log('Template ID:', getEnvVar('VITE_EMAILJS_TEMPLATE_ID'));

    await emailjs.send(
      getEnvVar('VITE_EMAILJS_SERVICE_ID'),
      getEnvVar('VITE_EMAILJS_TEMPLATE_ID'),
      templateParams
    );
    
    console.log('Email enviado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro detalhado ao enviar email:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export async function sendReminderEmail(ticket: Ticket): Promise<void> {
  try {
    const templateParams = {
      email: ticket.email,
      name: ticket.name,
      service_date: format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: ptBR }),
      department: ticket.department,
      problem: ticket.problem || 'Não especificado',
      analyst: ticket.analyst,
      from_name: "Suporte TI - SESC Pompeia",
      reply_to: 'nti.pompeia@sescsp.org.br',
      from_email: 'nti.pompeia@sescsp.org.br'
    };

    // Implementação do envio de email
    console.log('Enviando lembrete para:', templateParams);
    
    await emailjs.send(
      getEnvVar('VITE_EMAILJS_SERVICE_ID'),
      getEnvVar('VITE_EMAILJS_TEMPLATE_ID'),
      templateParams
    );
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    throw error;
  }
}

export async function checkAndSendReminders(): Promise<void> {
  try {
    const tickets = await getTickets();
    const now = new Date();

    for (const ticket of tickets) {
      if (!ticket.ticketOpened) {
        const lastReminder = ticket.lastReminderSent ? new Date(ticket.lastReminderSent) : null;
        const shouldSendReminder = !lastReminder || (now.getTime() - lastReminder.getTime() > 24 * 60 * 60 * 1000);

        if (shouldSendReminder) {
          await sendReminderEmail(ticket);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar e enviar lembretes:', error);
    throw error;
  }
} 