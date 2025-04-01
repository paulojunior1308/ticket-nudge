import express, { Request, Response } from 'express';
import { checkAndSendReminders } from '../../lib/services/email';

const router = express.Router();

// Rota para verificar e enviar lembretes
router.post('/check-reminders', async (_req: Request, res: Response) => {
  try {
    await checkAndSendReminders();
    res.json({ success: true, message: 'Lembretes verificados e enviados com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar lembretes:', error);
    res.status(500).json({ success: false, message: 'Erro ao verificar lembretes' });
  }
});

export default router; 