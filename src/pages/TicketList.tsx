import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Trash2, AlertTriangle, Mail, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { sendEmail } from "@/services/emailService";
import { emailTemplate, replaceTemplateVariables } from "@/lib/templates/emailTemplate";

interface TicketWithExternalId {
  id: string;
  externalId?: string;
  ticketOpened: boolean;
  [key: string]: any;
}

const TicketList = () => {
  const { 
    tickets, 
    isLoading, 
    updateTicket, 
    deleteTicket,
    filterOptions,
    setFilterOptions 
  } = useData();
  const navigate = useNavigate();
  const [editingExternalId, setEditingExternalId] = useState<string | null>(null);
  const [newExternalId, setNewExternalId] = useState("");

  // Obter departamentos únicos para o filtro
  const departments = [...new Set(tickets.map(ticket => ticket.department))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleTicketStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await updateTicket(id, { 
        ticketOpened: !currentStatus,
        status: currentStatus ? 'Pendente' : 'Aberto'
      });
      toast.success("Status do atendimento atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do atendimento");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    await deleteTicket(id);
  };

  const handleSearch = (value: string) => {
    setFilterOptions(prev => ({ ...prev, search: value }));
  };

  const handleDepartmentFilter = (value: string) => {
    setFilterOptions(prev => ({ ...prev, department: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilterOptions(prev => ({ ...prev, status: value }));
  };

  const handleSendManualReminder = async (ticketId: string) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) {
        throw new Error('Ticket não encontrado');
      }

      // Formatar a data para o formato brasileiro
      const serviceDate = new Date(ticket.serviceDate).toLocaleDateString('pt-BR');
      
      // Preparar as variáveis para o template
      const variables = {
        name: ticket.name,
        analyst: ticket.analyst || 'Analista de Suporte',
        service_date: serviceDate,
        department: ticket.department,
        problem: ticket.problem || 'Não especificado'
      };
      
      // Substituir as variáveis no template
      const emailMessage = replaceTemplateVariables(emailTemplate, variables);

      // Enviar o email
      await sendEmail(ticket.email, 'Lembrete de Chamado', emailMessage);
      
      // Atualiza o contador de lembretes
      await updateTicket(ticketId, {
        reminderCount: (ticket.reminderCount || 0) + 1,
        lastReminderSent: new Date().toISOString()
      });

      toast.success("Lembrete enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);
      toast.error("Erro ao enviar lembrete");
    }
  };

  const handleEditExternalId = (ticketId: string) => {
    setEditingExternalId(ticketId);
    setNewExternalId("");
  };

  const handleSaveExternalId = async (ticketId: string) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (newExternalId) {
        Object.assign(updateData, { externalId: newExternalId });
      }

      await updateTicket(ticketId, updateData);
      setEditingExternalId(null);
      toast.success("ID de referência atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar ID de referência:", error);
      toast.error("Erro ao atualizar ID de referência");
    }
  };

  const handleCancelEdit = () => {
    setEditingExternalId(null);
    setNewExternalId("");
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os atendimentos registrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Atendimento
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou email..."
                value={filterOptions.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select
                value={filterOptions.department}
                onValueChange={handleDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select
                value={filterOptions.status}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Usuário</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data do Atendimento</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Analista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ID de Referência</TableHead>
                <TableHead>Lembretes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.name}</div>
                      <div className="text-sm text-muted-foreground">{ticket.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.department}</TableCell>
                  <TableCell>{formatDate(ticket.serviceDate)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{ticket.problem || '-'}</TableCell>
                  <TableCell>{ticket.analyst || '-'}</TableCell>
                  <TableCell>
                    {ticket.ticketOpened ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Check className="mr-1 h-3 w-3" /> Aberto
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        <X className="mr-1 h-3 w-3" /> Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.ticketOpened && (
                      editingExternalId === ticket.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newExternalId}
                            onChange={(e) => setNewExternalId(e.target.value)}
                            placeholder="Digite o ID de referência"
                            className="h-8 w-[150px]"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSaveExternalId(ticket.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 font-mono"
                          onClick={() => handleEditExternalId(ticket.id)}
                        >
                          {(ticket as TicketWithExternalId).externalId || "Adicionar ID"}
                        </Button>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.reminderCount > 0 ? (
                      <div className="flex items-center">
                        <span className="mr-1">{ticket.reminderCount}</span>
                        {ticket.reminderCount >= 3 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-1" />
                        )}
                      </div>
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendManualReminder(ticket.id)}
                              className="hover:bg-primary/10 hover:text-primary text-muted-foreground"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enviar lembrete</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/tickets/edit/${ticket.id}`)}
                              className="hover:bg-primary/10 hover:text-primary text-muted-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar atendimento</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTicketStatusChange(ticket.id, ticket.ticketOpened)}
                              className={`hover:bg-primary/10 hover:text-primary text-muted-foreground ${
                                ticket.ticketOpened ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {ticket.ticketOpened ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{ticket.ticketOpened ? 'Marcar como Pendente' : 'Marcar como Aberto'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir atendimento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipProvider>
                    </div>
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

export default TicketList; 