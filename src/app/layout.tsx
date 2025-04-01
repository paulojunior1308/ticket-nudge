import { startReminderScheduler } from '@/lib/services/scheduler';

// Inicia o agendador quando o app é carregado
if (typeof window !== 'undefined') {
  startReminderScheduler();
} 