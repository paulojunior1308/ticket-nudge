import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Download } from "lucide-react";
import { exportToExcel } from "@/lib/utils/exportToExcel";

const RecurringTickets = () => {
  const { tickets, isLoading, updateTicket } = useData();

  const recurringTickets = tickets.filter(ticket => 
    !ticket.ticketOpened && ticket.reminderCount >= 3
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysSinceFirstReminder = (serviceDate: string) => {
    const firstReminderDate = new Date(serviceDate);
    firstReminderDate.setDate(firstReminderDate.getDate() + 1);
    const now = new Date();
    const diffTime = now.getTime() - firstReminderDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkAsOpened = (id: string) => {
    updateTicket(id, { ticketOpened: true });
  };

  const handleExportToExcel = () => {
    exportToExcel(recurringTickets);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimentos Reincidentes</h1>
          <p className="text-muted-foreground mt-1">
            Usuários com 3 ou mais lembretes enviados
          </p>
        </div>
        <Button onClick={handleExportToExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Usuário</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data do Atendimento</TableHead>
                <TableHead>Analista</TableHead>
                <TableHead>Dias em Aberto</TableHead>
                <TableHead>Lembretes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.department}</TableCell>
                  <TableCell>{formatDate(ticket.serviceDate)}</TableCell>
                  <TableCell>{ticket.analyst || '-'}</TableCell>
                  <TableCell>{getDaysSinceFirstReminder(ticket.serviceDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {ticket.reminderCount} lembretes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsOpened(ticket.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Marcar como Aberto
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringTickets; 