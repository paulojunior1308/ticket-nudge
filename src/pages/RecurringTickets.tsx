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
import { AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp } from "lucide-react";
import { exportToExcel } from "@/lib/utils/exportToExcel";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GroupedTickets {
  name: string;
  email: string;
  tickets: Array<any>;
}

const RecurringTickets = () => {
  const { tickets, isLoading, updateTicket } = useData();
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedUsers(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  // Agrupa todos os tickets por nome E email do usuário
  const groupedTickets = tickets.reduce((groups: { [key: string]: GroupedTickets }, ticket) => {
    // Ignora tickets que já foram abertos
    if (ticket.ticketOpened) return groups;

    const key = `${ticket.name.toLowerCase()}|${ticket.email.toLowerCase()}`; // Chave composta de nome e email
    if (!groups[key]) {
      groups[key] = {
        name: ticket.name,
        email: ticket.email,
        tickets: []
      };
    }
    // Adiciona o ticket ao grupo
    groups[key].tickets.push({
      ...ticket,
      serviceDate: ticket.serviceDate || new Date().toISOString()
    });
    return groups;
  }, {});

  // Filtra apenas os grupos que já têm 3 ou mais tickets e ordena
  const usersWithRecurringTickets = Object.values(groupedTickets)
    .filter(group => group.tickets.length >= 3)
    .sort((a, b) => b.tickets.length - a.tickets.length);

  // Ordena os tickets de cada grupo por data (mais recentes primeiro)
  usersWithRecurringTickets.forEach(group => {
    group.tickets.sort((a, b) => {
      const dateA = new Date(a.serviceDate).getTime();
      const dateB = new Date(b.serviceDate).getTime();
      return dateB - dateA;
    });
  });

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
    const allRecurringTickets = usersWithRecurringTickets.flatMap(group => group.tickets);
    exportToExcel(allRecurringTickets);
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
            Usuários com 3 ou mais atendimentos pendentes
          </p>
        </div>
        <Button onClick={handleExportToExcel} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      <div className="space-y-4">
        {usersWithRecurringTickets.map((group) => (
          <Card key={`${group.name}|${group.email}`}>
            <CardContent className="p-4">
              <Collapsible>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full"
                  onClick={() => toggleExpand(`${group.name}|${group.email}`)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.email}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {group.tickets.length} atendimentos pendentes
                    </Badge>
                  </div>
                  {expandedUsers.includes(`${group.name}|${group.email}`) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Data do Atendimento</TableHead>
                        <TableHead>Analista</TableHead>
                        <TableHead>Dias em Aberto</TableHead>
                        <TableHead>Lembretes</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
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
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}

        {usersWithRecurringTickets.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Não há usuários com 3 ou mais atendimentos pendentes no momento.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecurringTickets; 