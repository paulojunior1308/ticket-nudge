import { getTickets } from '@/lib/services/firebase';
import { sendReminderEmail } from '@/lib/services/email';
import { Ticket } from "@/types";

export async function checkAndSendReminders(tickets: Ticket[]): Promise<void> {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));

    for (const ticket of tickets) {
      if (
        ticket.status === "Pendente" &&
        new Date(ticket.createdAt) <= threeDaysAgo &&
        ticket.reminderCount < 3
      ) {
        await sendReminderEmail(
          ticket.email,
          "Lembrete: Ticket Pendente",
          `Olá ${ticket.name}, seu ticket ainda está pendente. Por favor, verifique o status.`
        );
      }
    }
  } catch (error) {
    console.error('Erro ao verificar e enviar lembretes:', error);
    throw error;
  }
} 