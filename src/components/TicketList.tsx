import { sendEmail } from '@/services/emailService';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface Ticket {
  id: string;
  name: string;
  email: string;
  department: string;
  serviceDate: string;
}

const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'chamados'));
        const ticketsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        setTickets(ticketsData);
      } catch (error) {
        console.error('Erro ao buscar tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSendManualReminder = async (ticket: Ticket) => {
    try {
      const emailMessage = `
        <h1>Lembrete de Chamado</h1>
        <p>Olá ${ticket.name},</p>
        <p>Este é um lembrete sobre seu chamado.</p>
        <p><strong>Detalhes do chamado:</strong></p>
        <ul>
          <li><strong>Nome:</strong> ${ticket.name}</li>
          <li><strong>Email:</strong> ${ticket.email}</li>
          <li><strong>Setor:</strong> ${ticket.department}</li>
          <li><strong>Data:</strong> ${new Date(ticket.serviceDate).toLocaleDateString('pt-BR')}</li>
        </ul>
        <p>Atenciosamente,<br>Equipe de Suporte TI - SESC Pompeia</p>
      `;

      await sendEmail(ticket.email, 'Lembrete de Chamado', emailMessage);
      alert('Lembrete enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      alert('Erro ao enviar lembrete');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Chamados</h1>
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{ticket.name}</h2>
            <p><strong>Email:</strong> {ticket.email}</p>
            <p><strong>Setor:</strong> {ticket.department}</p>
            <p><strong>Data:</strong> {new Date(ticket.serviceDate).toLocaleDateString('pt-BR')}</p>
            <button
              onClick={() => handleSendManualReminder(ticket)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Enviar Lembrete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketList; 