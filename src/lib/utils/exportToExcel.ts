import * as XLSX from 'xlsx';
import { Ticket } from '@/types';

export const exportToExcel = (tickets: Ticket[]) => {
  // Prepara os dados para exportação
  const data = tickets.map(ticket => ({
    'Nome': ticket.name,
    'Email': ticket.email,
    'Departamento': ticket.department,
    'Data do Atendimento': new Date(ticket.serviceDate).toLocaleDateString('pt-BR'),
    'Status': ticket.ticketOpened ? 'Chamado Aberto' : 'Pendente',
    'Problema': ticket.problem || '',
    'Analista': ticket.analyst || '',
    'Lembretes Enviados': ticket.reminderCount || 0,
    'Último Lembrete': ticket.lastReminderSent ? new Date(ticket.lastReminderSent).toLocaleDateString('pt-BR') : 'Nenhum',
    'Data de Criação': new Date(ticket.createdAt).toLocaleDateString('pt-BR'),
    'Última Atualização': new Date(ticket.updatedAt).toLocaleDateString('pt-BR')
  }));

  // Cria uma nova planilha
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajusta a largura das colunas
  const colWidths = [
    { wch: 30 }, // Nome
    { wch: 30 }, // Email
    { wch: 15 }, // Departamento
    { wch: 15 }, // Data do Atendimento
    { wch: 15 }, // Status
    { wch: 50 }, // Problema
    { wch: 20 }, // Analista
    { wch: 15 }, // Lembretes Enviados
    { wch: 15 }, // Último Lembrete
    { wch: 15 }, // Data de Criação
    { wch: 15 }  // Última Atualização
  ];
  ws['!cols'] = colWidths;

  // Cria um novo workbook e adiciona a planilha
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos');

  // Gera o arquivo e faz o download
  const fileName = `atendimentos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}; 