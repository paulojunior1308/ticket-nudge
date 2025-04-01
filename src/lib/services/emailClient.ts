import emailjs from '@emailjs/browser';
import { EmailTemplate } from '@/types';

// Inicializa o EmailJS com sua chave pública
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');

// Função para testar a conexão
export const testConnection = async () => {
  try {
    console.log('Iniciando teste de conexão com o EmailJS...');
    
    const templateParams = {
      to_email: 'paulo.junior@sescsp.org.br',
      to_name: 'Teste',
      service_date: new Date().toLocaleDateString('pt-BR'),
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      templateParams
    );

    console.log('Conexão com o EmailJS estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro detalhado ao conectar com o EmailJS:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log('Tentando enviar email para:', to);
    console.log('Assunto:', subject);
    
    const templateParams = {
      to_email: to,
      subject: subject,
      message: html,
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
      templateParams
    );
    
    console.log('Email enviado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro detalhado ao enviar email:', error);
    if (error instanceof Error) {
      console.error('Mensagem de erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
};

export const sendReminderEmail = async (
  to: string,
  userName: string,
  serviceDate: string,
  template: EmailTemplate
) => {
  const html = template.body
    .replace('{userName}', userName)
    .replace('{serviceDate}', new Date(serviceDate).toLocaleDateString('pt-BR'));

  return sendEmail(to, template.subject, html);
}; 