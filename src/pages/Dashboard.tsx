import React from "react";
import { useData } from "@/lib/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Ticket, 
  AlertCircle,
  Users, 
  FileText, 
  ArrowRight,
  TicketCheck
} from "lucide-react";

const Dashboard = () => {
  const { stats, tickets, isLoading } = useData();

  const chartData = [
    {
      name: "Total",
      value: stats.total,
    },
    {
      name: "Abertos",
      value: stats.open,
    },
    {
      name: "Pendentes",
      value: stats.pending,
    },
    {
      name: "Recorrentes",
      value: stats.recurring,
    },
  ];

  // Top departments with pending tickets
  const topDepartments = React.useMemo(() => {
    const departments: Record<string, number> = {};
    
    tickets
      .filter(ticket => !ticket.ticketOpened)
      .forEach(ticket => {
        departments[ticket.department] = (departments[ticket.department] || 0) + 1;
      });
    
    return Object.entries(departments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [tickets]);

  // Most recurring users (3+ reminders)
  const recurringUsers = React.useMemo(() => {
    return tickets
      .filter(ticket => !ticket.ticketOpened && ticket.reminderCount >= 3)
      .sort((a, b) => b.reminderCount - a.reminderCount)
      .slice(0, 5);
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-gentle text-primary text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema de lembretes de chamados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atendimentos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Atendimentos registrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chamados Abertos</CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.open / stats.total) * 100)}% do total`
                : "Nenhum chamado registrado"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando abertura de chamado
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reincidentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recurring}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com mais de um atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
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
                  formatter={(value: number, name: string) => {
                    return [value, name === "opened" ? "Abertos" : "Pendentes"];
                  }}
                  labelFormatter={(label: string) => `Data: ${label}`}
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

      {/* Additional Info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Top Departments */}
        <Card className="border-border/60">
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

        {/* Recurring Users */}
        <Card className="border-border/60">
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
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
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
