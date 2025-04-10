import React from "react";
import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Ticket, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Check, 
  X,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

const Tickets = () => {
  const { 
    filteredTickets, 
    isLoading, 
    updateTicket,
    deleteTicket,
    filterOptions,
    setFilterOptions,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    exportToCSV
  } = useData();

  // Departments derived from tickets
  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    filteredTickets.forEach(ticket => deptSet.add(ticket.department));
    return Array.from(deptSet).sort();
  }, [filteredTickets]);

  // Handle ticket status toggle
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os atendimentos registrados
          </p>
        </div>
        <Button asChild>
          <Link to="/tickets/new" className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Novo Atendimento
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, e-mail..."
                  className="pl-8"
                  value={filterOptions.search}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={filterOptions.department}
                onValueChange={(value) => setFilterOptions(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filterOptions.status}
                onValueChange={(value) => setFilterOptions(prev => ({ 
                  ...prev, 
                  status: value as "all" | "opened" | "pending" 
                }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Aberto">Abertos</SelectItem>
                  <SelectItem value="Pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurring users */}
            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring" 
                  checked={filterOptions.recurring}
                  onCheckedChange={(checked) => setFilterOptions(prev => ({ 
                    ...prev, 
                    recurring: checked as boolean 
                  }))}
                />
                <Label htmlFor="recurring" className="font-normal cursor-pointer">
                  Apenas reincidentes (3+ lembretes)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-[hsl(var(--border))] opacity-60 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <span>Carregando atendimentos...</span>
            ) : (
              <span>{filteredTickets.length} atendimentos encontrados</span>
            )}
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sortField === "name"}
                  onCheckedChange={() => setSortField("name")}
                >
                  Nome
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "email"}
                  onCheckedChange={() => setSortField("email")}
                >
                  Email
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "department"}
                  onCheckedChange={() => setSortField("department")}
                >
                  Departamento
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "serviceDate"}
                  onCheckedChange={() => setSortField("serviceDate")}
                >
                  Data do Atendimento
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortField === "reminderCount"}
                  onCheckedChange={() => setSortField("reminderCount")}
                >
                  Qtd. Lembretes
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Direção</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={sortDirection === "asc"}
                  onCheckedChange={() => setSortDirection("asc")}
                >
                  Crescente (A-Z, 0-9)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortDirection === "desc"}
                  onCheckedChange={() => setSortDirection("desc")}
                >
                  Decrescente (Z-A, 9-0)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={exportToCSV}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[150px] overflow-x-auto">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse-gentle text-primary text-lg font-medium">Carregando...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Ticket className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Nenhum atendimento encontrado</h3>
              <p className="text-muted-foreground text-center max-w-md mt-1">
                Tente ajustar os filtros ou adicione um novo atendimento para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[300px]"
                    onClick={() => {
                      if (sortField === "name") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("name");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Usuário {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "department") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("department");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Departamento {sortField === "department" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "serviceDate") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("serviceDate");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Data do Atendimento {sortField === "serviceDate" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "problem") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("problem");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Problema {sortField === "problem" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "analyst") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("analyst");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Analista {sortField === "analyst" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "ticketOpened") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("ticketOpened");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Status {sortField === "ticketOpened" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead 
                    onClick={() => {
                      if (sortField === "reminderCount") {
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("reminderCount");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Lembretes {sortField === "reminderCount" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
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
                      {ticket.reminderCount > 0 ? (
                        <div className="flex items-center">
                          <span className="mr-1">{ticket.reminderCount}</span>
                          {ticket.reminderCount >= 3 && (
                            <AlertCircle className="h-3.5 w-3.5 text-destructive ml-1" />
                          )}
                        </div>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end items-center gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={ticket.ticketOpened ? "ghost" : "outline"}
                                size="icon"
                                onClick={() => handleTicketStatusChange(ticket.id, ticket.ticketOpened)}
                                className={ticket.ticketOpened ? 
                                  "hover:bg-destructive/10 hover:text-destructive" : 
                                  "hover:bg-primary/10 hover:text-primary"}
                              >
                                {ticket.ticketOpened ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{ticket.ticketOpened ? 'Marcar como pendente' : 'Marcar como aberto'}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTicket(ticket.id)}
                                className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir atendimento</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Tickets;
