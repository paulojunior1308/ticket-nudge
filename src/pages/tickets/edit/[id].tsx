import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  serviceDate: z.date(),
  problem: z.string().optional(),
  analyst: z.string().min(1, "Analista é obrigatório"),
  status: z.enum(["Aberto", "Pendente"]),
});

const departments = [
  "Almoxarifado Geral",
  "Almoxarifado Generos",
  "Atendimento",
  "Audio",
  "Bens",
  "Bilheteria",
  "CEAT",
  "Central ADM",
  "Comunicação",
  "Compras",
  "Coordenadores",
  "Esportivo",
  "Infraestrutura",
  "Loja",
  "Nutricionistas",
  "Piscina",
  "Programação",
  "RH",
  "Secretaria",
  "Serviços",
  "Tesouraria"
];

const analysts = [
  "Paulo Junior",
  "Thiago Oliveira",
  "Sergio Rodrigo"
];

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, updateTicket } = useData();

  const ticket = tickets.find(t => t.id === id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ticket?.name || "",
      email: ticket?.email || "",
      department: ticket?.department || "",
      serviceDate: ticket ? new Date(ticket.serviceDate) : new Date(),
      problem: ticket?.problem || "",
      analyst: ticket?.analyst || "",
      status: ticket?.status || "Pendente",
    },
  });

  useEffect(() => {
    if (!ticket) {
      toast.error("Atendimento não encontrado");
      navigate("/tickets");
    }
  }, [ticket, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateTicket(id!, {
        ...values,
        serviceDate: values.serviceDate.toISOString(),
        ticketOpened: values.status === "Aberto",
      });
      toast.success("Atendimento atualizado com sucesso!");
      navigate("/tickets");
    } catch (error) {
      console.error("Erro ao atualizar atendimento:", error);
      toast.error("Erro ao atualizar atendimento");
    }
  };

  if (!ticket) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Usuário</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Atendimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="w-[200px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split('-').map(Number);
                          const date = new Date(year, month - 1, day, 12, 0, 0);
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analyst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analista Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o analista" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {analysts.map((analyst) => (
                          <SelectItem key={analyst} value={analyst}>
                            {analyst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit">Salvar Alterações</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tickets")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 