require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const cron = require('node-cron');

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const app = express();
const port = process.env.PORT || 10000;

// Configuração do CORS
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Em produção, permitir todas as origens
  app.use(cors({
    origin: true,
    credentials: true
  }));
  console.log('CORS configurado para permitir todas as origens em produção');
} else {
  // Em desenvolvimento, permitir apenas origens específicas
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'https://ticket-nudge.netlify.app', // Frontend no Netlify
    'https://ticket-nudge.netlify.app/', // Frontend no Netlify (com barra)
    'https://chamados-nti.netlify.app', // Frontend no Netlify (domínio atual)
    'https://chamados-nti.netlify.app/' // Frontend no Netlify (domínio atual com barra)
  ];

  app.use(cors({
    origin: function(origin, callback) {
      // Permitir requisições sem origin (como mobile apps ou curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'A política de CORS não permite acesso deste domínio.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));
  console.log('CORS configurado para permitir apenas origens específicas em desenvolvimento');
}

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_EMAIL_USER,
    pass: process.env.VITE_EMAIL_PASSWORD,
  },
});

// Função para enviar lembretes
const sendReminders = async () => {
  try {
    console.log('\n====================================');
    console.log('Iniciando envio de lembretes automáticos...');
    console.log('Data/Hora:', new Date().toLocaleString());
    console.log('====================================\n');
    
    const db = admin.firestore();
    const ticketsRef = db.collection('tickets');
    
    // Busca todos os tickets pendentes
    console.log('\nBuscando tickets pendentes...');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Início do dia atual
    
    const snapshot = await ticketsRef
      .where('status', '==', 'Pendente')
      .get();

    console.log(`Total de tickets pendentes: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log('❌ Nenhum ticket pendente encontrado');
      return;
    }

    let ticketsProcessados = 0;
    let emailsEnviados = 0;
    let ticketsJaNotificados = 0;

    for (const doc of snapshot.docs) {
      const ticket = { id: doc.id, ...doc.data() };
      ticketsProcessados++;
      
      console.log(`\nVerificando ticket ${ticket.id}:`);
      console.log(`- Nome: ${ticket.name}`);
      console.log(`- Email: ${ticket.email}`);
      console.log(`- Último lembrete: ${ticket.lastReminderSent || 'Nunca'}`);

      // Verifica se já enviamos lembrete hoje
      if (ticket.lastReminderSent) {
        const ultimoLembrete = new Date(ticket.lastReminderSent);
        if (ultimoLembrete.toDateString() === hoje.toDateString()) {
          console.log(`⏭️ Pulando ticket ${ticket.id} - já recebeu lembrete hoje`);
          ticketsJaNotificados++;
          continue;
        }
      }

      const emailMessage = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Lembrete de Chamado Pendente</h2>
        </div>
        <div class="content">
            <p>Olá ${ticket.name},</p>
            <p>Notamos que você tem um chamado pendente em nosso sistema:</p>
            <ul>
                <li><strong>Data do Atendimento:</strong> ${new Date(ticket.serviceDate).toLocaleDateString('pt-BR')}</li>
                <li><strong>Departamento:</strong> ${ticket.department}</li>
                <li><strong>Analista:</strong> ${ticket.analyst}</li>
                <li><strong>Descrição:</strong> ${ticket.problem || 'Não especificado'}</li>
            </ul>
            <p>Por favor, quando possível, registre este atendimento em nosso sistema de chamados.</p>
        </div>
        <div class="footer">
            <p>Atenciosamente,<br>Equipe de Suporte TI - SESC Pompeia</p>
        </div>
    </div>
</body>
</html>`;

      try {
        await transporter.sendMail({
          from: `Suporte TI - SESC Pompeia <${process.env.VITE_EMAIL_USER}>`,
          to: ticket.email,
          subject: 'Lembrete: Chamado Pendente',
          html: emailMessage,
        });

        // Atualiza a data do último lembrete enviado
        await ticketsRef.doc(ticket.id).update({
          lastReminderSent: new Date().toISOString(),
          reminderCount: admin.firestore.FieldValue.increment(1)
        });

        emailsEnviados++;
        console.log(`✅ Email enviado com sucesso para ${ticket.email}`);
      } catch (emailError) {
        console.error(`❌ Erro ao enviar email para ${ticket.email}:`, emailError);
      }
    }

    console.log('\n====================================');
    console.log('Resumo do processamento:');
    console.log(`- Tickets pendentes verificados: ${ticketsProcessados}`);
    console.log(`- Emails enviados: ${emailsEnviados}`);
    console.log(`- Tickets já notificados hoje: ${ticketsJaNotificados}`);
    console.log('====================================\n');

  } catch (error) {
    console.error('❌ Erro ao enviar lembretes automáticos:', error);
  }
};

// Testa a conexão com o Firestore
admin.firestore().collection('tickets').get()
  .then(snapshot => {
    console.log(`✅ Conexão com Firestore OK - ${snapshot.size} tickets encontrados`);
  })
  .catch(error => {
    console.error('❌ Erro ao conectar com Firestore:', error);
  });

// Remove o envio de teste ao iniciar o servidor
console.log('\n🚀 Servidor iniciado na porta ${port}');

// Agenda o envio de lembretes para rodar uma vez por dia às 10:00
cron.schedule('0 10 * * *', () => {
  console.log('\n🕐 Executando verificação diária de lembretes às 10:00...');
  sendReminders();
});

// Rota para verificação manual (apenas para testes)
app.get('/check-reminders', async (req, res) => {
  try {
    console.log('\n📧 Verificação manual solicitada...');
    await sendReminders();
    res.status(200).json({ 
      success: true, 
      message: 'Verificação concluída',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro na verificação manual:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar lembretes',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Envia lembretes imediatamente ao iniciar o servidor (para teste)
console.log('\n🚀 Servidor iniciado. Enviando lembretes iniciais...');
sendReminders();

// Rota para enviar email
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    await transporter.sendMail({
      from: `Suporte TI - SESC Pompeia <${process.env.VITE_EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/test', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin || 'Nenhuma origem',
      allowed: true
    }
  });
});

app.listen(port, () => {
  console.log(`\n🚀 Servidor iniciado na porta ${port}`);
}); 