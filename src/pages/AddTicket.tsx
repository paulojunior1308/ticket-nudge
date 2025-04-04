import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { useEffect, useState } from "react";
import { testConnection } from "@/lib/services/email";
import { userSuggestions, addUserSuggestion } from "@/lib/data/users";

// Inicializa o EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  serviceDate: z.date({
    required_error: "Data do atendimento é obrigatória",
  }),
  problem: z.string().min(1, "Descrição do problema é obrigatória"),
  reminderCount: z.number().default(0),
  status: z.enum(["Aberto", "Pendente"]).default("Pendente"),
  analyst: z.string().min(1, "Analista é obrigatório")
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      serviceDate: new Date(),
      problem: "",
      reminderCount: 0,
      status: "Pendente",
      analyst: ""
    },
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

  useEffect(() => {
    testConnection().then(success => {
      if (success) {
        console.log("Conexão com EmailJS está funcionando");
      } else {
        console.error("Problema na conexão com EmailJS");
      }
    });
  }, []);

  const sendEmail = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Variáveis de ambiente:', {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      });

      const templateParams = {
        ...values,
        service_date: format(values.serviceDate, 'dd/MM/yyyy', { locale: ptBR }),
        reply_to: 'nti.pompeia@sescsp.org.br',
        from_name: "Suporte TI - SESC Pompeia",
        from_email: 'nti.pompeia@sescsp.org.br'
      };

      console.log('Form Values:', values);
      console.log('Analyst Value:', values.analyst);
      console.log('Template Params:', templateParams);

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Resposta do EmailJS:', response);
      toast.success("Email enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      if (error instanceof Error) {
        console.error("Detalhes do erro:", error.message);
      }
      toast.error("Erro ao enviar email de notificação");
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Adiciona o usuário à lista de sugestões
      addUserSuggestion({
        name: values.name,
        email: values.email,
        department: values.department
      });

      // Adiciona o ticket
      await addTicket({
        ...values,
        serviceDate: values.serviceDate.toISOString(),
        status: values.status,
        ticketOpened: false,
        reminderCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Envia o email
      await sendEmail(values);
      
      toast.success("Atendimento registrado com sucesso!");
      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Erro completo:", error);
      toast.error("Erro ao registrar atendimento ou enviar email");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Novo Atendimento</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Digite ou selecione um nome" 
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
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                  <Input placeholder="email@sescsp.org.br" {...field} />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
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
                <FormLabel>Problema</FormLabel>
                <FormControl>
                  <Input placeholder="Descreva o problema" {...field} />
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

          <Button type="submit" className="w-full">
            Registrar Atendimento
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddTicket;
