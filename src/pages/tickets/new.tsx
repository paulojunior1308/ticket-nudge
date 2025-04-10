import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// Lista de analistas
const analysts = ["Paulo Junior", "Thiago Oliveira", "Sergio Rodrigo"];

// Esquema de validação com Zod
const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  serviceDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Data inválida"), // Valida se a string é uma data válida
  problem: z.string().min(1, "Descrição do problema é obrigatória"),
  analyst: z.string().min(1, "Analista é obrigatório"), // Novo campo
});

const NewTicketPage = () => {
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
    department: "",
    serviceDate: new Date().toISOString().split("T")[0], // Ajuste aqui
    problem: "",
    analyst: "",
  },
});

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Dados do formulário:", values);
    sendEmail(values);
  };

  const sendEmail = async (values: z.infer<typeof formSchema>) => {
    try {
      const templateParams = {
        to_name: values.name,
        to_email: values.email,
        email: values.email,
        name: values.name,
        service_date: format(values.serviceDate, "dd/MM/yyyy", { locale: ptBR }),
        department: values.department,
        problem: values.problem,
        analyst: values.analyst, // Incluindo o analista
        reply_to: "nti.pompeia@sescsp.org.br",
        from_name: "Suporte TI - SESC Pompeia",
        from_email: "nti.pompeia@sescsp.org.br",
      };

      console.log("Parâmetros do e-mail:", templateParams);
      // Adicione aqui a chamada para o serviço de envio de e-mail
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Registrar Novo Atendimento</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <input className="border p-2 w-full rounded" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo E-mail */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <input type="email" className="border p-2 w-full rounded" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Departamento */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <input className="border p-2 w-full rounded" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Data do Atendimento */}
          <FormField
  control={form.control}
  name="serviceDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Data do Atendimento</FormLabel>
      <FormControl>
        <input
          type="date"
          className="border p-2 w-full rounded"
          value={field.value || ""} // Garante que o valor seja uma string
          onChange={(e) => field.onChange(e.target.value)} // Mantém a data como string
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

          {/* Campo Descrição do Problema */}
          <FormField
            control={form.control}
            name="problem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Problema</FormLabel>
                <FormControl>
                  <textarea className="border p-2 w-full rounded" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Analista Responsável */}
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

          {/* Botão de Envio */}
          <Button type="submit" className="w-full">
            Registrar Atendimento
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewTicketPage;
