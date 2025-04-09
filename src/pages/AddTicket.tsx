import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useData } from "@/lib/context/DataContext";
import { userSuggestions } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TicketStatus = "Pendente" | "Aberto";

export interface Ticket {
  id?: string;
  name: string;
  email: string;
  department: string;
  serviceDate: string;
  problem: string;
  analyst: string;
  status: TicketStatus;
  reminderCount: number;
  ticketOpened: boolean;
  createdAt: string;
  updatedAt: string;
}

const ticketSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  serviceDate: z.date(),
  problem: z.string().min(1, "Descrição do problema é obrigatória"),
  analyst: z.string().min(1, "Analista é obrigatório"),
  status: z.enum(["Pendente", "Aberto"]),
  reminderCount: z.number(),
  ticketOpened: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

type TicketFormData = z.infer<typeof ticketSchema>;

const analysts = [
  "Paulo Junior",
  "Thiago Oliveira",
  "Sergio Rodrigo"
];

const AddTicket = () => {
  const navigate = useNavigate();
  const { addTicket } = useData();
  const [filteredUsers, setFilteredUsers] = useState(userSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      serviceDate: new Date(),
      problem: "",
      analyst: "",
      status: "Pendente",
      reminderCount: 0,
      ticketOpened: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Função para filtrar usuários baseado no input
  const handleNameInput = (value: string) => {
    const filtered = userSuggestions.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setShowSuggestions(true);
  };

  // Função para selecionar um usuário da lista
  const handleUserSelect = (user: typeof userSuggestions[0]) => {
    form.setValue("name", user.name);
    form.setValue("email", user.email);
    form.setValue("department", user.department);
    setShowSuggestions(false);
  };

  const onSubmit = async (data: TicketFormData) => {
    try {
      const ticket: Omit<Ticket, "id"> = {
        ...data,
        serviceDate: format(data.serviceDate, "yyyy-MM-dd'T'HH:mm:ss"),
        createdAt: format(data.createdAt, "yyyy-MM-dd'T'HH:mm:ss"),
        updatedAt: format(data.updatedAt, "yyyy-MM-dd'T'HH:mm:ss")
      };
      
      await addTicket(ticket);
      toast.success("Ticket registrado com sucesso!");
      form.reset();
      navigate("/");
    } catch (error) {
      toast.error("Erro ao registrar ticket");
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Registrar Novo Atendimento</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="text-gray-700">Nome</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Digite ou selecione um nome" 
                          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameInput(e.target.value);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                        />
                        {showSuggestions && field.value && filteredUsers.length > 0 && (
                          <div className="absolute w-full mt-1 max-h-48 overflow-auto bg-white border rounded-md shadow-lg z-50">
                            {filteredUsers.map((user) => (
                              <div
                                key={`${user.name}-${user.email}`}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => handleUserSelect(user)}
                              >
                                <div className="font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@sescsp.org.br" 
                        className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                        <SelectItem value="Almoxarifado Geral">Almoxarifado Geral</SelectItem>
                        <SelectItem value="Almoxarifado Generos">Almoxarifado Generos</SelectItem>
                        <SelectItem value="Atendimento">Atendimento</SelectItem>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Bens">Bens</SelectItem>
                        <SelectItem value="Bilheteria">Bilheteria</SelectItem>
                        <SelectItem value="CEAT">CEAT</SelectItem>
                        <SelectItem value="Central ADM">Central ADM</SelectItem>
                        <SelectItem value="Comunicação">Comunicação</SelectItem>
                        <SelectItem value="Compras">Compras</SelectItem>
                        <SelectItem value="Coordenadores">Coordenadores</SelectItem>
                        <SelectItem value="Esportivo">Esportivo</SelectItem>
                        <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                        <SelectItem value="Loja">Loja</SelectItem>
                        <SelectItem value="NTI">NTI</SelectItem>
                        <SelectItem value="Nutricionistas">Nutricionistas</SelectItem>
                        <SelectItem value="Odontologia">Odontologia</SelectItem>
                        <SelectItem value="Piscina">Piscina</SelectItem>
                        <SelectItem value="Programação">Programação</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Secretaria">Secretaria</SelectItem>
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Tesouraria">Tesouraria</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analyst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Analista</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Descrição do Problema</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descreva o problema..." 
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-gray-700">Data do Atendimento</FormLabel>
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                      className="rounded-lg border-2 border-gray-200 p-4 bg-white shadow-lg"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                        caption_label: "text-gray-900",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-9 w-9 bg-transparent p-0 opacity-75 hover:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-500 rounded-md w-10 font-normal text-sm",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm relative p-0 hover:bg-gray-100 rounded-md transition-colors",
                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-200 rounded-md transition-colors",
                        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-md font-bold shadow-lg ring-2 ring-blue-600 ring-offset-2",
                        day_today: "bg-gray-100 text-gray-900 rounded-md font-semibold border-2 border-gray-300",
                        day_outside: "text-gray-400 opacity-50",
                        day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                        day_hidden: "invisible",
                      }}
                    />
                    <div className="mt-4 text-center">
                      <p className="text-gray-700 font-medium">
                        Data selecionada: {field.value ? format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Nenhuma data selecionada"}
                      </p>
                    </div>
                  </div>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-6">
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg transition-colors"
              >
                Registrar Atendimento
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddTicket;
