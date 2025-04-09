import React, { useEffect } from "react";
import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  AlertTriangle, 
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Recurring = () => {
  const { 
    tickets, 
    isLoading, 
    setFilterOptions,
    updateTicket,
    exportToCSV
  } = useData();

  // Set the recurring filter on mount
  useEffect(() => {
    setFilterOptions(prev => ({ ...prev, recurring: true }));
    
    // Clean up on unmount
    return () => {
      setFilterOptions(prev => ({ ...prev, recurring: false }));
    };
  }, [setFilterOptions]);

  // Get recurring users (3+ reminders)
  const recurringUsers = React.useMemo(() => {
    return tickets.filter(ticket => !ticket.ticketOpened && ticket.reminderCount >= 3);
  }, [tickets]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calculate days since first reminder
  const getDaysSinceFirstReminder = (serviceDate: string, reminderCount: number) => {
    if (reminderCount === 0) return 0;
    
    const firstReminderDate = new Date(serviceDate);
    firstReminderDate.setDate(firstReminderDate.getDate() + 1); // First reminder is sent a day after service
    
    const now = new Date();
    const diffTime = now.getTime() - firstReminderDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Mark ticket as opened
  const handleMarkAsOpened = (id: string) => {
    updateTicket(id, { ticketOpened: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários Reincidentes</h1>
          <p className="text-muted-foreground mt-1">
            Usuários que receberam 3 ou mais lembretes
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportToCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      <Card className="border border-[hsl(var(--border))] opacity-60">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Atenção Necessária
          </CardTitle>
          <CardDescription>
            Estes usuários receberam 3 ou mais lembretes sem abertura de chamado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse-gentle text-primary text-lg font-medium">Carregando...</div>
              </div>
            ) : recurringUsers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium">Nenhum usuário reincidente</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Todos os usuários abriram chamados ou receberam menos de 3 lembretes. Parabéns!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Usuário</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Data do Atendimento</TableHead>
                    <TableHead>Lembretes</TableHead>
                    <TableHead>Dias Pendente</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringUsers.map((user) => {
                    const daysPending = getDaysSinceFirstReminder(user.serviceDate, user.reminderCount);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{formatDate(user.serviceDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            {user.reminderCount} lembretes
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {daysPending} {daysPending === 1 ? 'dia' : 'dias'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsOpened(user.id)}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              <span>Marcar como aberto</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center"
                              asChild
                            >
                              <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Boas Práticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Contato Direto</h3>
              <p className="text-muted-foreground text-sm">
                Para usuários com 5 ou mais lembretes, considere um contato telefônico para entender 
                o motivo da não abertura do chamado.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Verificação de Processo</h3>
              <p className="text-muted-foreground text-sm">
                Em caso de múltiplos usuários do mesmo departamento, verifique se há 
                problemas de processo no departamento específico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recurring;
