import { useData } from "@/lib/context/DataContext";
import { EmailTemplate } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EmailTemplateForm from "@/components/EmailTemplateForm";

export default function Emails() {
  const { emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleSubmit = async (data: EmailTemplate) => {
    try {
      if (selectedTemplate) {
        await updateEmailTemplate(selectedTemplate.id, data);
        toast.success("Template atualizado com sucesso!");
      } else {
        await addEmailTemplate(data);
        toast.success("Template criado com sucesso!");
      }
      setIsDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error("Erro ao salvar o template");
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este template?")) {
      try {
        await deleteEmailTemplate(id);
        toast.success("Template excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir o template");
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates de Email</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emailTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>Assunto: {template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{template.body}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  disabled={template.isDefault}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {selectedTemplate ? "editar o" : "criar um novo"} template de email.
            </DialogDescription>
          </DialogHeader>
          <EmailTemplateForm
            onSubmit={handleSubmit}
            initialData={selectedTemplate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
