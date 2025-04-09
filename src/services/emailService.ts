const API_URL = 'http://localhost:10000';

export const sendEmail = async (to: string, subject: string, message: string) => {
  try {
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, message }),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar email');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}; 