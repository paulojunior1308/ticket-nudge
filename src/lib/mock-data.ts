import { Ticket, EmailTemplate } from "@/types";

const departments = [
  "Administração",
  "Alimentação",
  "Biblioteca",
  "Comunicação",
  "Cultura",
  "Educação",
  "Esportes",
  "Manutenção",
  "Odontologia",
  "Programação",
  "Recursos Humanos",
  "Saúde",
  "Tecnologia",
  "Turismo"
];

const problems = [
  "Computador não liga",
  "Internet lenta",
  "Impressora não funciona",
  "Email não abre",
  "Sistema travando",
  "Tela azul",
  "Mouse não funciona",
  "Teclado com problemas",
  "Sem acesso à rede",
  "Vírus detectado"
];

// Adicione a lista de analistas
const mockAnalysts = [
  "Paulo Junior",
  "Thiago Oliveira",
  "Sergio Rodrigo"
];

// Generate random tickets
export const generateMockTickets = (count: number): Ticket[] => {
  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    const serviceDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const createdAt = new Date(serviceDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000);
    const ticketOpened = Math.random() > 0.5;
    const reminderCount = ticketOpened ? 0 : Math.floor(Math.random() * 5);
    const lastReminderSent = reminderCount > 0 ? new Date(updatedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined;

    return {
      id: `ticket-${i + 1}`,
      name: `Usuário ${i + 1}`,
      email: `usuario${i + 1}@sescsp.org.br`,
      department: departments[Math.floor(Math.random() * departments.length)],
      serviceDate: serviceDate.toISOString(),
      ticketOpened,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      reminderCount,
      lastReminderSent,
      problem: problems[Math.floor(Math.random() * problems.length)],
      status: ticketOpened ? "Aberto" : "Pendente",
      analyst: mockAnalysts[Math.floor(Math.random() * mockAnalysts.length)]
    };
  });
};

// Mock email templates
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Lembrete Padrão',
    subject: 'Lembrete: Abertura de Chamado',
    body: `Olá {{name}},

Passando para lembrar sobre o atendimento realizado no dia {{service_date}} no departamento de {{department}}.

Por favor, não se esqueça de abrir um chamado no sistema para que possamos registrar corretamente o atendimento.

Problema relatado: {{problem}}

Atenciosamente,
{{from_name}}`,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-2',
    name: 'Lembrete Urgente',
    subject: 'URGENTE: Abertura de Chamado Pendente',
    body: `Prezado(a) {{name}},

Notamos que ainda não foi aberto um chamado referente ao atendimento realizado no dia {{service_date}} no departamento de {{department}}.

É muito importante que o chamado seja aberto para mantermos nossos registros atualizados.

Problema relatado: {{problem}}

Por favor, abra o chamado o mais breve possível.

Atenciosamente,
{{from_name}}`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
