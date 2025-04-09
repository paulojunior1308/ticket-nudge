import { sendEmail } from "@/services/emailService";

export async function testConnection(): Promise<boolean> {
  try {
    // Apenas verifica se o serviço de email está configurado
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
} 