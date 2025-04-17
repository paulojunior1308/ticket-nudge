import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Ticket, EmailTemplate } from "@/types";
import { LaptopLoan } from "@/lib/constants/laptops";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { toast } from "sonner";
import { sendEmail } from "@/services/emailService";

interface FilterOptions {
  search: string;
  department: string;
  status: 'all' | 'Aberto' | 'Pendente';
  recurring: boolean;
}

interface DataContextType {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  emailTemplates: EmailTemplate[];
  isLoading: boolean;
  stats: {
    total: number;
    open: number;
    pending: number;
    recurring: number;
  };
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  sortField: keyof Ticket;
  setSortField: React.Dispatch<React.SetStateAction<keyof Ticket>>;
  sortDirection: 'asc' | 'desc';
  setSortDirection: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  addTicket: (ticket: Omit<Ticket, "id">) => Promise<void>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addEmailTemplate: (template: Omit<EmailTemplate, "id">) => Promise<void>;
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;
  exportToCSV: () => void;
  error: string | null;
  addLaptopLoan: (loan: Omit<LaptopLoan, "id">) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({
  tickets: [],
  filteredTickets: [],
  emailTemplates: [],
  isLoading: false,
  stats: {
    total: 0,
    open: 0,
    pending: 0,
    recurring: 0
  },
  filterOptions: {
    search: '',
    department: 'all',
    status: 'all',
    recurring: false
  },
  sortField: 'createdAt',
  setSortField: () => {},
  sortDirection: 'desc',
  setSortDirection: () => {},
  setFilterOptions: () => {},
  addTicket: async () => {},
  updateTicket: async () => {},
  deleteTicket: async () => {},
  addEmailTemplate: async () => {},
  updateEmailTemplate: async () => {},
  deleteEmailTemplate: async () => {},
  exportToCSV: () => {},
  error: null,
  addLaptopLoan: async () => {}
});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    department: 'all',
    status: 'all',
    recurring: false
  });
  const [sortField, setSortField] = useState<keyof Ticket>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    try {
      const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
      const ticketsData = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      setTickets(ticketsData);

      const templatesSnapshot = await getDocs(collection(db, 'emailTemplates'));
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      setEmailTemplates(templatesData);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newTicket = {
        ...ticketData,
        createdAt: now,
        updatedAt: now,
        reminderCount: 0,
        status: 'Pendente',
        ticketOpened: false,
        lastReminderSent: now
      };

      const docRef = await addDoc(collection(db, 'tickets'), newTicket);
      
      const emailMessage = `
<!DOCTYPE html>
<html>
<head>
    <style>
body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f3f4f6;
            border-radius: 8px 8px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .header h2 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 0 20px;
        }
        .details {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        .details-item {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-item:last-child {
            border-bottom: none;
        }
        .details-label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 140px;
        }
        .message {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #0369a1;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.9em;
        }
        .signature {
            margin-top: 15px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Olá, ${ticketData.name}! 👋</h2>
        </div>
        <div class="content">
             <p>Esperamos que esteja tendo um ótimo dia! Passando para compartilhar os detalhes do atendimento que <span style="font-weight: bold; font-size: 1.1em; color: #2563eb;">${ticketData.analyst}</span> realizou recentemente.</p>
            
            <div class="details">
                <div class="details-item">
                    <span class="details-label">Data:</span>
                    <span>${new Date(ticketData.serviceDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Departamento:</span>
                    <span>${ticketData.department}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Solução Realizada:</span>
                    <span>${ticketData.problem}</span>
                </div>
            </div>

            <div class="message">
                <p>💡 Para mantermos nosso histórico atualizado, quando possível, pedimos gentilmente que você registre este atendimento em nosso sistema de chamados.</p>
                <p>Caso você já tenha registrado o chamado, ficaríamos muito gratos se pudesse nos responder este email com o número do chamado! 🙏</p>
            </div>

            <div class="footer">
                <p>Agradecemos sua parceria!</p>
                <div class="signature">
                    <p>Atenciosamente,<br>
                    Equipe de Suporte TI - SESC Pompeia</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

      await sendEmail(ticketData.email, 'Novo Chamado Registrado', emailMessage);
      
      await fetchData();
      toast.success("Atendimento adicionado com sucesso");
    } catch (error) {
      console.error('Erro ao adicionar ticket:', error);
      toast.error("Erro ao adicionar atendimento");
      throw error;
    }
  };

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      await fetchData();
      toast.success("Atendimento atualizado com sucesso");
    } catch (err) {
      toast.error("Erro ao atualizar atendimento");
      setError(err instanceof Error ? err.message : 'Erro ao atualizar ticket');
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tickets', id));
      await fetchData();
      toast.success("Atendimento excluído com sucesso");
    } catch (err) {
      toast.error("Erro ao excluir atendimento");
      setError(err instanceof Error ? err.message : 'Erro ao deletar ticket');
    }
  };

  const addEmailTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newTemplate = {
        ...templateData,
        createdAt: now,
        updatedAt: now
      };

      await addDoc(collection(db, 'emailTemplates'), newTemplate);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar template');
    }
  };

  const updateEmailTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    try {
      const templateRef = doc(db, 'emailTemplates', id);
      await updateDoc(templateRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar template');
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'emailTemplates', id));
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar template');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = !filterOptions.search || 
        ticket.name.toLowerCase().includes(filterOptions.search.toLowerCase()) ||
        ticket.email.toLowerCase().includes(filterOptions.search.toLowerCase());

      const matchesDepartment = filterOptions.department === 'all' || 
        ticket.department === filterOptions.department;

      const matchesStatus = filterOptions.status === 'all' ||
        (filterOptions.status === 'Aberto' && ticket.ticketOpened) ||
        (filterOptions.status === 'Pendente' && !ticket.ticketOpened);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [tickets, filterOptions]);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.ticketOpened).length,
    pending: tickets.filter(t => !t.ticketOpened).length,
    recurring: tickets.filter(t => t.reminderCount > 0).length
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Departamento', 'Data do Serviço', 'Status', 'Problema', 'Lembretes Enviados', 'Último Lembrete', 'Criado em', 'Atualizado em'];
    const rows = filteredTickets.map(ticket => [
      ticket.id,
      ticket.name,
      ticket.email,
      ticket.department,
      format(new Date(ticket.serviceDate), 'dd/MM/yyyy HH:mm'),
      ticket.status,
      ticket.problem,
      ticket.reminderCount,
      ticket.lastReminderSent ? format(new Date(ticket.lastReminderSent), 'dd/MM/yyyy HH:mm') : '-',
      format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm'),
      format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addLaptopLoan = async (loan: Omit<LaptopLoan, "id">) => {
    try {
      await addDoc(collection(db, "laptopLoans"), {
        ...loan,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error("Error adding laptop loan:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      tickets: filteredTickets,
      filteredTickets,
      emailTemplates,
      isLoading,
      stats,
      filterOptions,
      setFilterOptions,
      sortField,
      setSortField,
      sortDirection,
      setSortDirection,
      addTicket,
      updateTicket,
      deleteTicket,
      addEmailTemplate,
      updateEmailTemplate,
      deleteEmailTemplate,
      exportToCSV,
      error,
      addLaptopLoan
    }}>
      {children}
    </DataContext.Provider>
  );
};
