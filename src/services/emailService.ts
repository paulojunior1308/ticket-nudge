import { User } from '@/types/user';
import nodemailer from 'nodemailer';

export class EmailService {
  private static instance: EmailService;
  private users: User[] = [];
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Configurar o transporter do nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendDailyReminder(user: User): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Lembrete: Abertura de Chamado Pendente',
        html: `
          <h2>Olá ${user.name},</h2>
          <p>Este é um lembrete para abrir seu chamado diário.</p>
          <p>Por favor, acesse o sistema e abra um novo chamado para registrar suas atividades.</p>
          <br>
          <p>Atenciosamente,</p>
          <p>Sistema de Chamados</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado com sucesso para: ${user.email}`);
      
      // Atualizar o status do usuário após o envio
      user.lastReminderSent = new Date();
    } catch (error) {
      console.error(`Erro ao enviar email para ${user.email}:`, error);
      throw error;
    }
  }

  async sendDailyReminders(): Promise<void> {
    const pendingUsers = this.users.filter(user => user.status === 'pending');
    
    for (const user of pendingUsers) {
      await this.sendDailyReminder(user);
    }
  }

  setUsers(users: User[]): void {
    this.users = users;
  }

  getPendingUsers(): User[] {
    return this.users.filter(user => user.status === 'pending');
  }
} 