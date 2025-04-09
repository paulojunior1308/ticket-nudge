import { sendEmail } from '@/services/emailService';

const handleSubmit = async () => {
  try {
    // ... existing code ...
    
    // Enviar email
    const emailMessage = `
      <h1>Novo Chamado Registrado</h1>
      <p>Olá ${formData.name},</p>
      <p>Seu chamado foi registrado com sucesso!</p>
      <p><strong>Detalhes do chamado:</strong></p>
      <ul>
        <li><strong>Nome:</strong> ${formData.name}</li>
        <li><strong>Email:</strong> ${formData.email}</li>
        <li><strong>Setor:</strong> ${formData.department}</li>
        <li><strong>Data:</strong> ${new Date(formData.serviceDate).toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Atenciosamente,<br>Equipe de Suporte TI - SESC Pompeia</p>
    `;

    await sendEmail(formData.email, 'Novo Chamado Registrado', emailMessage);
    
    // ... existing code ...
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    // ... existing code ...
  }
}; 