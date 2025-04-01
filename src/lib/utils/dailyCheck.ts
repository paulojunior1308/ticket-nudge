import { getTickets } from '@/lib/services/firebase';
import { sendReminderEmail } from '@/lib/services/email';

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