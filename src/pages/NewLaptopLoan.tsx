import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { useData } from "@/lib/context/DataContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LaptopLoan } from "@/lib/constants/laptops";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";

const formSchema = z.object({
  laptopId: z.string().min(1, {
    message: "ID do laptop é obrigatório",
  }),
  userName: z.string().min(1, {
    message: "Nome do usuário é obrigatório",
  }),
  registrationNumber: z.string().min(1, {
    message: "Número de registro é obrigatório",
  }),
  location: z.string().min(1, {
    message: "Localização é obrigatória",
  }),
  hasPointer: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

// Lista predefinida de laptops
const LAPTOPS = [
  "351752",
  "323817",
  "351751",
  "351749",
  "351750",
  "323818"
];

// Lista predefinida de localizações
const LOCATIONS = [
  "Espaço Cênico",
  "Convivência",
  "House Comedoria",
  "House Teatro",
  "Galpão",
  "Ateliê Marcenaria",
  "Ateliê Cerâmica",
  "Ateliê Artes Mistas",
  "Ateliê Costura",
  "Ateliê Pintura",
  "Ateliê Gravura",
  "Ateliê Textil",
  "7º Esportivo",
  "8º Esportivo",
  "9º Esportivo",
  "10º Esportivo",
  "11º Esportivo"
];

export default function NewLaptopLoan() {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const { addLaptopLoan } = useData();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      laptopId: "",
      userName: "",
      registrationNumber: "",
      location: "",
      hasPointer: false,
    },
  });

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsSignatureEmpty(true);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (values) => {
    try {
      if (isSignatureEmpty) {
        toast.error("Por favor, assine o termo de empréstimo");
        return;
      }

      const signatureData = signaturePadRef.current?.toDataURL() || "";

      const loan: Omit<LaptopLoan, "id"> = {
        ...values,
        signature: signatureData,
        loanDate: new Date().toISOString(),
        isReturned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addLaptopLoan(loan);
      toast.success("Empréstimo registrado com sucesso!");
      navigate("/laptop-loan");
    } catch (error) {
      console.error("Erro ao registrar empréstimo:", error);
      toast.error("Erro ao registrar empréstimo");
    }
  };

  const downloadTerm = () => {
    const doc = new jsPDF();
    const loan = form.getValues();
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Configuração inicial do documento
    doc.setFont("helvetica");
    
    // Título
    doc.setFontSize(16);
    doc.text("TERMO DE RESPONSABILIDADE", 105, 20, { align: "center" });
    
    // Texto inicial
    doc.setFontSize(12);
    doc.text("Eu, ", 20, 40);
    
    // Nome do usuário em negrito
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(loan.userName, 35, 40);
    
    // Texto continuação
    doc.setFont("helvetica", "normal");
    doc.text(", chapa ", 35 + doc.getTextWidth(loan.userName), 40);
    
    // Número da chapa em negrito
    doc.setFont("helvetica", "bold");
    doc.text(loan.registrationNumber, 35 + doc.getTextWidth(loan.userName + ", chapa "), 40);
    
    // Texto continuação
    doc.setFont("helvetica", "normal");
    doc.text(", por meio deste instrumento declaro me responsabilizar pela", 35 + doc.getTextWidth(loan.userName + ", chapa " + loan.registrationNumber), 40);
    
    // Segunda linha
    doc.text("posse e conservação do Notebook, ", 20, 50);
    
    // Número do notebook em negrito
    doc.setFont("helvetica", "bold");
    doc.text("FCBM-" + loan.laptopId, 20 + doc.getTextWidth("posse e conservação do Notebook, "), 50);
    
    // Texto continuação
    doc.setFont("helvetica", "normal");
    doc.text(", setorizado no setor NTI, me", 20 + doc.getTextWidth("posse e conservação do Notebook, FCBM-" + loan.laptopId), 50);
    
    // Texto normal
    doc.text("comprometendo comunicar e aguardar a retirada do equipamento pelo Analista", 20, 60);
    
    doc.text("Me comprometo a devolver o mencionado bem em perfeito estado de conservação, como", 20, 80);
    doc.text("atualmente se encontro, ao fim do prazo estabelecido.", 20, 90);
    
    doc.text("Em caso de extravio ou danos que comprovem a perda total ou parcial do bem, fico", 20, 110);
    doc.text("obrigado a ressarcir os prejuízos ocasionados.", 20, 120);
    
    doc.text("Local - ", 20, 140);
    
    // Local em negrito
    doc.setFont("helvetica", "bold");
    doc.text(loan.location, 20 + doc.getTextWidth("Local - "), 140);
    
    // Texto sobre ponteira
    doc.setFont("helvetica", "normal");
    doc.text("Apresentador com ponteira: ", 20, 160);
    
    // Status da ponteira em negrito
    doc.setFont("helvetica", "bold");
    doc.text(loan.hasPointer ? "Sim" : "Não", 20 + doc.getTextWidth("Apresentador com ponteira: "), 160);
    
    // Data
    doc.setFont("helvetica", "normal");
    doc.text("Data: ", 20, 180);
    
    // Data em negrito
    doc.setFont("helvetica", "bold");
    doc.text(currentDate, 20 + doc.getTextWidth("Data: "), 180);
    
    // Assinatura
    doc.setFont("helvetica", "normal");
    doc.text("Assinatura:", 20, 200);
    
    // Adiciona a linha para o nome
    doc.line(20, 240, 200, 240);
    
    // Adiciona os dados abaixo da linha
    doc.setFontSize(10);
    doc.text(loan.userName, 20, 250);
    doc.text("Chapa: " + loan.registrationNumber, 20, 260);
    doc.text("Data: " + currentDate, 20, 270);
    
    // Adiciona a imagem da assinatura
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      doc.addImage(signatureData, 'PNG', 20, 205, 50, 20);
    }
    
    doc.save("termo_responsabilidade.pdf");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Empréstimo de Notebook</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para registrar um novo empréstimo
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="laptopId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FCBM</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o FCBM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LAPTOPS.map((laptop) => (
                      <SelectItem key={laptop} value={laptop}>
                        {laptop}
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
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Usuário</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do usuário" {...field} />
                </FormControl>
                <FormDescription>
                  Nome da pessoa que está pegando o laptop emprestado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapa do funcionário</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a chapa do funcionário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
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
            name="hasPointer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Ponteira</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Card className="p-4">
            <FormLabel>Assinatura Digital</FormLabel>
            <div className="border rounded-md mt-2" style={{ height: "200px" }}>
              <SignaturePad
                ref={signaturePadRef}
                canvasProps={{
                  className: "w-full h-full"
                }}
                onBegin={() => setIsSignatureEmpty(false)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={clearSignature}
            >
              Limpar Assinatura
            </Button>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button type="submit" className="flex-1">
              Registrar Empréstimo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={downloadTerm}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Baixar Termo
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 