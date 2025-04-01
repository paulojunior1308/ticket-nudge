export interface Ticket {
  id: string;
  name: string;
  email: string;
  department: string;
  serviceDate: string;
  problem: string;
  analyst: string;
  ticketOpened: boolean;
  reminderCount: number;
  lastReminderSent?: string;
  createdAt: string;
  updatedAt: string;
  status: 'Aberto' | 'Pendente';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} 