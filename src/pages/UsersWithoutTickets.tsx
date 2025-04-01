import { useEffect, useState } from 'react';
import { UsersWithoutTickets } from '@/components/UsersWithoutTickets';
import { User } from '@/types/user';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export default function UsersWithoutTicketsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsersWithoutTickets();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários sem chamados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, status: 'pending' | 'completed') => {
    try {
      const updatedUser = await api.updateUserStatus(userId, status);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      toast({
        title: 'Sucesso',
        description: 'Status do usuário atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do usuário.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Usuários sem Chamados</h1>
      <UsersWithoutTickets users={users} onStatusUpdate={handleStatusUpdate} />
    </div>
  );
} 