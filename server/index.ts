import express, { RequestHandler } from 'express';
import cors from 'cors';
import { EmailService } from '../src/services/emailService';
import { startDailyEmailReminder } from '../src/scripts/dailyEmailReminder';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'completed';
}

type RequestParams = {
  id: string;
};

type StatusUpdateBody = {
  status: 'pending' | 'completed';
};

const app = express();
const port = process.env.PORT || 3001;
const emailService = EmailService.getInstance();

app.use(cors());
app.use(express.json());

const users: User[] = [
  { id: '1', name: 'João Silva', email: 'user1@example.com', status: 'pending' },
  { id: '2', name: 'Maria Santos', email: 'user2@example.com', status: 'pending' }
];

// Rotas
const getUsers: RequestHandler = (_req, res) => {
  res.json(users);
};

const updateUserStatus: RequestHandler<RequestParams, any, StatusUpdateBody> = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const user = users.find(u => u.id === id);
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  user.status = status;
  res.json(user);
};

const sendUserEmail: RequestHandler<RequestParams> = async (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  try {
    await emailService.sendDailyReminder(user);
    res.json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
};

app.get('/api/users-without-tickets', getUsers);
app.patch('/api/users-without-tickets/:id/status', updateUserStatus);
app.post('/api/users-without-tickets/:id/send-email', sendUserEmail);

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  
  // Iniciar o serviço de lembretes
  startDailyEmailReminder();
}); 