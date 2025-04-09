import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import emailRoutes from './routes/email';
import { checkAndSendReminders } from '../lib/services/email';

// Carrega as variáveis de ambiente
dotenv.config();

// Log das variáveis de ambiente (sem valores sensíveis)
console.log('Variáveis de ambiente carregadas:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_FROM: process.env.SMTP_FROM
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/email', emailRoutes);

// Rota de health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Rota para verificar e enviar lembretes
app.post('/api/check-reminders', async (_req: Request, res: Response) => {
  try {
    await checkAndSendReminders();
    res.json({ success: true, message: 'Lembretes verificados e enviados com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar lembretes:', error);
    res.status(500).json({ success: false, message: 'Erro ao verificar lembretes' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Teste de conexão disponível em: http://localhost:${port}/api/email/test-connection`);
}); 