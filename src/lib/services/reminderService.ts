import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import emailjs from '@emailjs/browser';
import { Ticket } from '@/types';
import { toast } from 'sonner';

// Tipos
interface EmailTemplateParams {
  [key: string]: string | number;
  to_name: string;
  to_email: string;
  email: string;
  name: string;
  service_date: string;
  department: string;
  problem: string;
  analyst: string;
  reminder_count: number;
  from_name: string;
  reply_to: string;
  from_email: string;
}

interface ReminderResult {
  success: boolean;
  email: string;
  name: string;
  error?: Error;
}

// Funções auxiliares
const createEmailParams = (ticket: Ticket, reminderCount: number): EmailTemplateParams => ({
  to_name: ticket.name,
  to_email: ticket.email,
  email: ticket.email,
  name: ticket.name,
  service_date: format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: ptBR }),
  department: ticket.department,
  problem: ticket.problem || 'Não especificado',
  analyst: ticket.analyst,
  reminder_count: reminderCount,
  from_name: "Suporte TI - SESC Pompeia",
  reply_to: 'nti.pompeia@sescsp.org.br',
  from_email: 'nti.pompeia@sescsp.org.br'
});

const validateEnvironmentVars = () => {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID || !import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
    throw new Error('Variáveis de ambiente do EmailJS não configuradas');
  }
};

const updateTicketReminder = async (ticketId: string, reminderCount: number) => {
  const now = new Date();
  const ticketRef = doc(db, 'tickets', ticketId);
  
  await updateDoc(ticketRef, {
    reminderCount,
    lastReminderSent: now.toISOString(),
    updatedAt: now.toISOString()
  });
};

// Função auxiliar para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função principal para enviar lembretes
const sendReminderEmail = async (ticket: Ticket): Promise<ReminderResult> => {
  try {
    // Verificação do status no início da função
    if (ticket.status !== 'Pendente') {
      console.log(`Ignorando ticket ${ticket.id} - Status: ${ticket.status}`);
      return {
        success: false,
        email: ticket.email,
        name: ticket.name,
        error: new Error(`Ticket não está pendente (Status: ${ticket.status})`)
      };
    }

    validateEnvironmentVars();
    
    const newReminderCount = (ticket.reminderCount || 0) + 1;
    const templateParams = createEmailParams(ticket, newReminderCount);
    
    console.log(`Preparando envio para ticket ${ticket.id} - Status: ${ticket.status}`);
    
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    await updateTicketReminder(ticket.id, newReminderCount);
    
    console.log(`✓ Lembrete enviado com sucesso para ${ticket.email} (Ticket ID: ${ticket.id})`);
    
    return {
      success: true,
      email: ticket.email,
      name: ticket.name
    };
  } catch (error) {
    console.error(`✗ Erro ao enviar lembrete para ${ticket.email}:`, error);
    return {
      success: false,
      email: ticket.email,
      name: ticket.name,
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
};

// Função para envio manual de lembretes
export const sendManualReminder = async (ticketId: string): Promise<void> => {
  try {
    console.log('Iniciando envio manual para ticket:', ticketId);
    
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      throw new Error('Ticket não encontrado');
    }

    const ticket = { id: ticketSnap.id, ...ticketSnap.data() } as Ticket;
    
    if (ticket.status !== 'Pendente') {
      throw new Error('Ticket não está pendente');
    }

    const result = await sendReminderEmail(ticket);
    
    if (!result.success) {
      throw result.error;
    }

    toast.success('Lembrete enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar lembrete manual:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao enviar lembrete');
    throw error;
  }
};

// Função para verificação automática de lembretes
export const checkAndSendReminders = async () => {
  try {
    console.log('=== Iniciando verificação de lembretes ===');
    
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('status', '==', 'Pendente'));
    const querySnapshot = await getDocs(q);
    
    const pendingTickets = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Ticket))
      .filter(ticket => {
        const isPending = ticket.status === 'Pendente';
        console.log(`Ticket ${ticket.id} - Status: ${ticket.status} - Será processado: ${isPending}`);
        return isPending;
      });

    console.log(`\nEncontrados ${pendingTickets.length} tickets pendentes para processamento`);
    
    if (pendingTickets.length === 0) {
      console.log('Nenhum ticket pendente encontrado');
      return [];
    }

    // Envia os emails com delay entre cada um
    const results = [];
    for (const ticket of pendingTickets) {
      try {
        const result = await sendReminderEmail(ticket);
        results.push(result);
        // Aguarda 2 segundos entre cada envio
        await delay(2000);
      } catch (error) {
        console.error(`Erro ao enviar email para ticket ${ticket.id}:`, error);
        results.push({
          success: false,
          email: ticket.email,
          name: ticket.name,
          error: error instanceof Error ? error : new Error('Erro desconhecido')
        });
      }
    }

    const successfulReminders = results.filter(r => r.success);
    const failedReminders = results.filter(r => !r.success);

    console.log('\n=== Resumo da operação ===');
    console.log(JSON.stringify({
      totalTickets: pendingTickets.length,
      lembretesEnviados: successfulReminders.length,
      lembretesFalhos: failedReminders.length,
      detalhes: failedReminders.map(r => ({
        email: r.email,
        erro: r.error?.message
      }))
    }, null, 2));

    return successfulReminders;
  } catch (error) {
    console.error('Erro ao verificar e enviar lembretes:', error);
    toast.error('Erro ao verificar lembretes');
    throw error;
  }
};

export const manualCheckAndSendReminders = async () => {
  try {
    const results = await checkAndSendReminders();
    return {
      success: true,
      sentReminders: results.length,
      details: results
    };
  } catch (error) {
    console.error('Erro na verificação manual:', error);
    throw error;
  }
}; 