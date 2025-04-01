import { User } from '@/types/user';

const API_BASE_URL = '/api';

export const api = {
  async getUsersWithoutTickets(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users-without-tickets`);
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários sem chamados');
    }
    return response.json();
  },

  async updateUserStatus(userId: string, status: 'pending' | 'completed'): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users-without-tickets/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Erro ao atualizar status do usuário');
    }
    return response.json();
  },

  async sendTestEmail(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users-without-tickets/${userId}/send-email`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Erro ao enviar email de teste');
    }
  },
}; 