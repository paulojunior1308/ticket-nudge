export interface Ticket {
  id: string;
  name: string;
  email: string;
  department: string;
  serviceDate: string;  // ISO format
  problem?: string;
  analyst: string;
  status: "Aberto" | "Pendente";
  ticketOpened: boolean;
  reminderCount: number;
  lastReminderSent?: string; // ISO format
  externalId?: string;
  createdAt: string;    // ISO format
  updatedAt: string;    // ISO format
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

export interface DashboardStats {
  totalTickets: number;
  openedTickets: number;
  pendingTickets: number;
  recurringUsers: number;
}

export type SortField = 'name' | 'email' | 'department' | 'serviceDate' | 'reminderCount';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  department: string;
  status: 'all' | 'Aberto' | 'Pendente';
  startDate?: string;
  endDate?: string;
  recurring: boolean;
}

export interface LaptopLoan {
  id: string;
  laptopId: string;
  userName: string;
  registrationNumber: string; // chapa
  location: string;
  hasPointer: boolean;
  signature: string; // URL da assinatura no Firebase Storage
  loanDate: string;
  returnDate?: string;
  isReturned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Laptop {
  id: string;
  model: string;
  serialNumber: string;
  isAvailable: boolean;
}

export const PREDEFINED_LOCATIONS = [
  "Auditório",
  "Comedoria",
  "Sala de Reunião 1",
  "Sala de Reunião 2",
  "Sala de Reunião 3",
  "Espaço de Tecnologias",
  "Área de Convivência",
  "Teatro"
] as const;

export type PredefinedLocation = typeof PREDEFINED_LOCATIONS[number];
