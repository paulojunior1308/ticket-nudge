import { useState, useEffect } from "react";
import { EmailTemplate } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface EmailTemplateFormProps {
  onSubmit: (data: EmailTemplate) => Promise<void>;
  initialData?: EmailTemplate | null;
}

export default function EmailTemplateForm({ onSubmit, initialData }: EmailTemplateFormProps) {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: "",
    subject: "",
    body: "",
    isDefault: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as EmailTemplate);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Template</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Lembrete Padrão"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Assunto do E-mail</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="Ex: Lembrete: Abertura de Chamado Pendente"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Corpo do E-mail</Label>
          <Textarea
            id="body"
            name="body"
            placeholder="Digite o conteúdo do e-mail aqui..."
            rows={10}
            value={formData.body}
            onChange={handleChange}
            required
          />
          <p className="text-sm text-muted-foreground">
            Use as variáveis {"{name}"}, {"{serviceDate}"} e {"{reminderCount}"} para personalizar o e-mail.
          </p>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button type="submit">
          {initialData ? "Salvar Alterações" : "Criar Template"}
        </Button>
      </DialogFooter>
    </form>
  );
} 