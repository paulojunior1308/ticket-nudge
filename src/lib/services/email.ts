import { sendEmail } from "@/services/emailService";

export async function sendReminderEmail(to: string, subject: string, content: string) {
  try {
    await sendEmail(to, subject, content);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de lembrete:', error);
    return false;
  }
} 