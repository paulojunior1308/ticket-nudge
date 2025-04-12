import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Trash2, AlertTriangle, Mail, Pencil, ArrowUpDown } from "lucide-react";
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

interface Ticket {
  id: string;
  name: string;
  email: string;
  department: string;
  serviceDate: string;
  problem?: string;
  analyst?: string;
  status: string;
  ticketOpened: boolean;
  externalId?: string;
  reminderCount?: number;
  lastReminderSent?: string;
  [key: string]: any; // Permite acessar propriedades dinâmicas
}

interface TicketWithExternalId extends Ticket {
  externalId?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'serviceDate', direction: 'desc' });

  // Obter departamentos únicos para o filtro
  const departments = [...new Set(tickets.map(ticket => ticket.department))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleTicketStatusChange = async (id: string, currentStatus: string) => {
    try {
      await updateTicket(id, { 
        status: currentStatus === 'Aberto' ? 'Pendente' : 'Aberto',
        ticketOpened: currentStatus === 'Aberto' ? false : true
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

  const sendManualReminder = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }

    const emailMessage = `
      <h1>Lembrete de Chamado</h1>
      <p>Olá ${ticket.name},</p>
      <p>Este é um lembrete sobre seu chamado.</p>
      <p><strong>Detalhes do chamado:</strong></p>
      <ul>
        <li><strong>Nome:</strong> ${ticket.name}</li>
        <li><strong>Email:</strong> ${ticket.email}</li>
        <li><strong>Setor:</strong> ${ticket.department}</li>
        <li><strong>Data:</strong> ${new Date(ticket.serviceDate).toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Atenciosamente,<br>Equipe de Suporte TI - SESC Pompeia</p>
    `;

    await sendEmail(ticket.email, 'Lembrete de Chamado', emailMessage);
    
    // Atualiza o contador de lembretes
    await updateTicket(ticketId, {
      reminderCount: (ticket.reminderCount || 0) + 1,
      lastReminderSent: new Date().toISOString()
    });
  };

  const handleSendManualReminder = async (ticketId: string) => {
    try {
      await sendManualReminder(ticketId);
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

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedTickets = () => {
    if (!sortConfig.key) return tickets;

    return [...tickets].sort((a: Ticket, b: Ticket) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'serviceDate') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[300px] cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Usuário
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'name' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Departamento
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'department' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('serviceDate')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Data do Atendimento
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'serviceDate' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('problem')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Problema
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'problem' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('analyst')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Analista
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'analyst' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'status' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('externalId')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      ID de Referência
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'externalId' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('reminderCount')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Lembretes
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.key === 'reminderCount' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedTickets().map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="text-center">
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-muted-foreground">{ticket.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{ticket.department}</TableCell>
                    <TableCell className="text-center">{formatDate(ticket.serviceDate)}</TableCell>
                    <TableCell className="text-center max-w-[300px] truncate">{ticket.problem || '-'}</TableCell>
                    <TableCell className="text-center">{ticket.analyst || '-'}</TableCell>
                    <TableCell className="text-center">
                      {ticket.status === 'Aberto' ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          <Check className="mr-1 h-3 w-3" /> Aberto
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          <X className="mr-1 h-3 w-3" /> Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {ticket.ticketOpened && (
                        editingExternalId === ticket.id ? (
                          <div className="flex items-center justify-center gap-2">
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
                    <TableCell className="text-center">
                      {ticket.reminderCount > 0 ? (
                        <div className="flex items-center justify-center">
                          <span className="mr-1">{ticket.reminderCount}</span>
                          {ticket.reminderCount >= 3 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-1" />
                          )}
                        </div>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
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
                                onClick={() => handleTicketStatusChange(ticket.id, ticket.status)}
                                className={`hover:bg-primary/10 hover:text-primary text-muted-foreground ${
                                  ticket.status === 'Aberto' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {ticket.status === 'Aberto' ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{ticket.status === 'Aberto' ? 'Marcar como Pendente' : 'Marcar como Aberto'}</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketList; 