export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  ticketDescription?: string;
  status: 'pending' | 'completed';
  lastReminderSent?: Date;
} 