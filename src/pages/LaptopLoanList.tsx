import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LaptopLoan } from "@/lib/constants/laptops";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Laptop, Plus, RotateCcw, CheckCircle2, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";
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
import { jsPDF } from "jspdf";

export default function LaptopLoanList() {
  const [loans, setLoans] = useState<(LaptopLoan & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "laptopLoans"));
      const loansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (LaptopLoan & { id: string })[];

      // Ordenar por data de empréstimo (mais recente primeiro)
      loansData.sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
      
      setLoans(loansData);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (loanId: string) => {
    try {
      const loanRef = doc(db, "laptopLoans", loanId);
      await updateDoc(loanRef, {
        isReturned: true,
        returnDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast.success("Notebook marcado como devolvido!");
      fetchLoans(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao atualizar empréstimo:", error);
      toast.error("Erro ao marcar notebook como devolvido");
    }
  };

  const handleDelete = async (loanId: string) => {
    try {
      const loanRef = doc(db, "laptopLoans", loanId);
      await deleteDoc(loanRef);
      toast.success("Empréstimo excluído com sucesso!");
      fetchLoans();
    } catch (error) {
      console.error("Erro ao excluir empréstimo:", error);
      toast.error("Erro ao excluir empréstimo");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatDateForDocument = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const downloadTerm = async (loan: LaptopLoan & { id: string }) => {
    try {
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Configurar fonte e tamanho
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      
      // Título
      doc.text("TERMO DE RESPONSABILIDADE", 105, 20, { align: "center" });
      
      // Configurar fonte para o conteúdo
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Conteúdo do termo
      const content = [
        `Eu, ${loan.userName}, chapa ${loan.registrationNumber}, por meio deste instrumento declaro me responsabilizar pela posse e conservação do Notebook, FCBM-${loan.laptopId}, setorizado no setor NTI, me comprometendo comunicar e aguardar a retirada do equipamento pelo Analista`,
        "",
        "Me comprometo a devolver o mencionado bem em perfeito estado de conservação, como atualmente se encontro, ao fim do prazo estabelecido.",
        "",
        "Em caso de extravio ou danos que comprovem a perda total ou parcial do bem, fico obrigado a ressarcir os prejuízos ocasionados.",
        "",
        `Local - ${loan.location}`,
        "",
        `Apresentador ${loan.hasPointer ? "com ponteira" : "sem ponteira"}`,
        "",
        `Data: ${formatDateForDocument(loan.loanDate)}`,
        "",
        "Assinatura:"
      ];
      
      // Adicionar o conteúdo ao PDF
      let y = 40;
      content.forEach(line => {
        // Dividir linhas longas para evitar que saiam da página
        const lines = doc.splitTextToSize(line, 170);
        lines.forEach((line: string) => {
          doc.text(line, 20, y);
          y += 7;
        });
      });
      
      // Adicionar a imagem da assinatura se existir
      if (loan.signature) {
        try {
          // Adicionar a imagem da assinatura
          doc.addImage(loan.signature, 'PNG', 20, y, 50, 20);
          y += 30;
        } catch (error) {
          console.error("Erro ao adicionar assinatura:", error);
          y += 10;
        }
      } else {
        // Linha para assinatura manual se não houver imagem
        doc.line(20, y, 100, y);
        y += 10;
      }
      
      // Adicionar informações de rodapé
      y += 10;
      doc.line(20, y, 190, y);
      y += 10;
      doc.text(`${loan.userName}`, 20, y);
      y += 7;
      doc.text(`Chapa: ${loan.registrationNumber}`, 20, y);
      y += 7;
      doc.text(`Data: ${formatDateForDocument(loan.loanDate)}`, 20, y);
      
      // Salvar o PDF
      doc.save(`termo_responsabilidade_${loan.laptopId}_${loan.userName.replace(/\s+/g, "_")}.pdf`);
      
      toast.success("Termo de responsabilidade baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o termo de responsabilidade");
    }
  };

  const StatusBadge = ({ isReturned }: { isReturned: boolean }) => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      isReturned
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
    }`}>
      {isReturned ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Devolvido
        </>
      ) : (
        <>
          <Laptop className="w-3.5 h-3.5" />
          Em uso
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Empréstimos de Notebooks</h1>
          <p className="text-muted-foreground">
            Gerencie os empréstimos de notebooks
          </p>
        </div>
        <Link to="/laptop-loan/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Empréstimo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <p>Carregando...</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notebook</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Data do Empréstimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ponteira</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <Laptop className="h-10 w-10 mb-2" />
                      <p>Nenhum empréstimo registrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.laptopId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{loan.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          Chapa: {loan.registrationNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{loan.location}</TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(loan.loanDate)}</p>
                        {loan.returnDate && (
                          <p className="text-sm text-muted-foreground">
                            Devolvido em: {formatDate(loan.returnDate)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge isReturned={loan.isReturned} />
                    </TableCell>
                    <TableCell>
                      {loan.hasPointer ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {!loan.isReturned && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Devolver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Devolução</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja marcar este notebook como devolvido? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReturn(loan.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirmar Devolução
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => downloadTerm(loan)}
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          PDF
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(loan.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 