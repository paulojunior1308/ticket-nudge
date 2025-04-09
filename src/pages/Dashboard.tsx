import React, { useState } from "react";
import { useData } from "@/lib/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Ticket, 
  AlertCircle,
  Users, 
  FileText, 
  ArrowRight,
  TicketCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { tickets, isLoading } = useData();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("all");

  // Filtra tickets pelo período selecionado
  const filteredTickets = React.useMemo(() => {
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.serviceDate);
      return ticketDate >= dateRange.from! && ticketDate <= dateRange.to!;
    });
  }, [tickets, dateRange]);

  // Filtra tickets pelo analista selecionado
  const analystFilteredTickets = React.useMemo(() => {
    if (selectedAnalyst === "all") return filteredTickets;
    return filteredTickets.filter(ticket => ticket.analyst === selectedAnalyst);
  }, [filteredTickets, selectedAnalyst]);

  // Dados para o gráfico de barras
  const chartData = [
    {
      name: "Total",
      value: analystFilteredTickets.length,
    },
    {
      name: "Abertos",
      value: analystFilteredTickets.filter(t => t.ticketOpened).length,
    },
    {
      name: "Pendentes",
      value: analystFilteredTickets.filter(t => !t.ticketOpened).length,
    },
    {
      name: "Recorrentes",
      value: analystFilteredTickets.filter(t => t.reminderCount >= 3).length,
    },
  ];

  // Dados para o gráfico de pizza (por departamento)
  const departmentData = React.useMemo(() => {
    const departments: Record<string, number> = {};
    analystFilteredTickets.forEach(ticket => {
      departments[ticket.department] = (departments[ticket.department] || 0) + 1;
    });
    return Object.entries(departments).map(([name, value]) => ({ name, value }));
  }, [analystFilteredTickets]);

  // Dados para o gráfico de linha (tendência)
  const trendData = React.useMemo(() => {
    const days: Record<string, number> = {};
    analystFilteredTickets.forEach(ticket => {
      const date = format(new Date(ticket.serviceDate), 'dd/MM');
      days[date] = (days[date] || 0) + 1;
    });
    return Object.entries(days)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([name, value]) => ({ name, value }));
  }, [analystFilteredTickets]);

  // Lista de analistas únicos
  const analysts = React.useMemo(() => {
    const uniqueAnalysts = new Set(tickets.map(t => t.analyst));
    return Array.from(uniqueAnalysts).filter(Boolean);
  }, [tickets]);

  // Top departments with pending tickets
  const topDepartments = React.useMemo(() => {
    const departments: Record<string, number> = {};
    
    analystFilteredTickets
      .filter(ticket => !ticket.ticketOpened)
      .forEach(ticket => {
        departments[ticket.department] = (departments[ticket.department] || 0) + 1;
      });
    
    return Object.entries(departments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [analystFilteredTickets]);

  // Most recurring users (3+ reminders)
  const recurringUsers = React.useMemo(() => {
    return analystFilteredTickets
      .filter(ticket => !ticket.ticketOpened && ticket.reminderCount >= 3)
      .sort((a, b) => b.reminderCount - a.reminderCount)
      .slice(0, 5);
  }, [analystFilteredTickets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-gentle text-primary text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema de lembretes de chamados
          </p>
        </div>
        <div className="flex gap-4">
          <DateRangePicker
            date={dateRange}
            onDateChange={(date) => {
              if (date) {
                setDateRange(date);
              }
            }}
            locale={ptBR}
          />
          <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por analista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os analistas</SelectItem>
              {analysts.map(analyst => (
                <SelectItem key={analyst} value={analyst}>
                  {analyst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border border-[hsl(var(--border))] opacity-60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atendimentos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analystFilteredTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Atendimentos registrados no período
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-[hsl(var(--border))] opacity-60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chamados Abertos</CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analystFilteredTickets.filter(t => t.ticketOpened).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {analystFilteredTickets.length > 0
                ? `${Math.round((analystFilteredTickets.filter(t => t.ticketOpened).length / analystFilteredTickets.length) * 100)}% do total`
                : "Nenhum chamado registrado"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-[hsl(var(--border))] opacity-60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analystFilteredTickets.filter(t => !t.ticketOpened).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando abertura de chamado
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-[hsl(var(--border))] opacity-60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reincidentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analystFilteredTickets.filter(t => t.reminderCount >= 3).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários com mais de um atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Distribuição de chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "0.25rem" }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Atendimentos" 
                    stackId="a" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Por Departamento</CardTitle>
            <CardDescription>Distribuição por setor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência</CardTitle>
            <CardDescription>Evolução diária de chamados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Top Departamentos</CardTitle>
            <CardDescription>Com mais chamados pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            {topDepartments.length > 0 ? (
              <ul className="space-y-3">
                {topDepartments.map((dept, index) => (
                  <li key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className="text-muted-foreground">{dept.count} pendentes</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-center py-4">
                Não há departamentos com chamados pendentes
              </p>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/tickets" className="flex items-center">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Users */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Reincidentes</CardTitle>
          <CardDescription>3+ lembretes enviados</CardDescription>
        </CardHeader>
        <CardContent>
          {recurringUsers.length > 0 ? (
            <ul className="space-y-3">
              {recurringUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <span className="text-destructive font-medium">
                    {user.reminderCount} lembretes
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic text-center py-4">
              Não há usuários reincidentes
            </p>
          )}
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/recurring" className="flex items-center">
                Ver reincidentes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link to="/tickets/new" className="flex items-center justify-center">
            <Ticket className="mr-2 h-4 w-4" />
            Adicionar Atendimento
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/tickets" className="flex items-center justify-center">
            <FileText className="mr-2 h-4 w-4" />
            Ver Todos Atendimentos
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
