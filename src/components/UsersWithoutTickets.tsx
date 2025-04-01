import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';
import { User } from '@/types/user';

interface UsersWithoutTicketsProps {
  users: User[];
  onStatusUpdate: (userId: string, status: 'pending' | 'completed') => void;
}

export function UsersWithoutTickets({ users, onStatusUpdate }: UsersWithoutTicketsProps) {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuários sem Chamados");
    XLSX.writeFile(workbook, "usuarios_sem_chamados.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Usuários sem Chamados</h2>
        <Button onClick={exportToExcel}>Exportar para Excel</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Descrição do Chamado</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.ticketDescription || '-'}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'pending' ? 'destructive' : 'default'}>
                  {user.status === 'pending' ? 'Pendente' : 'Concluído'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(user.id, 'completed')}
                >
                  Marcar como Concluído
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 