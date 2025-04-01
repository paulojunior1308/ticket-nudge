import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as User, 
  Mail, 
  Bell, 
  Shield
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EmailTest } from '@/components/EmailTest';

const Settings = () => {
  const { toast } = useToast();
  
  const [profileForm, setProfileForm] = useState({
    name: "Administrator",
    email: "admin@example.com",
    role: "Administrador"
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    reminderFrequency: "daily",
    digestEmails: true
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate saving profile
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso."
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate saving notification settings
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas."
    });
  };
  
  const handleToggleChange = (field: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <div className="space-y-6">
        <EmailTest />
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Segurança</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Informações do Perfil</span>
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={profileForm.role}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">
                      A função é atribuída pelo administrador do sistema e não pode ser alterada.
                    </p>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Preferências de Notificação</span>
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="text-base">Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba atualizações sobre o sistema por email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={() => handleToggleChange("emailNotifications")}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="digestEmails" className="text-base">Emails de Resumo</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba relatórios resumidos sobre os atendimentos pendentes
                        </p>
                      </div>
                      <Switch
                        id="digestEmails"
                        checked={notificationSettings.digestEmails}
                        onCheckedChange={() => handleToggleChange("digestEmails")}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="submit">Salvar Preferências</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span>Configurações de Lembretes</span>
                </CardTitle>
                <CardDescription>
                  Configure os lembretes automáticos para os usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Frequência de Lembretes</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Os lembretes são enviados diariamente até que o chamado seja aberto
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                        Primeiro lembrete: 1 dia após o atendimento
                      </span>
                      <span>→</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                        Lembretes subsequentes: Diariamente
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base">Alertas de Reincidência</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usuários são marcados como reincidentes após 3 lembretes sem abertura de chamado
                    </p>
                  </div>
                  
                  <div className="border border-border p-4 rounded-md bg-muted/30 mt-4">
                    <p className="text-sm text-muted-foreground italic">
                      Nota: Estas configurações são definidas globalmente para o sistema e não podem 
                      ser alteradas por usuários individuais. Para solicitar alterações, entre em 
                      contato com o administrador do sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Segurança da Conta</span>
                </CardTitle>
                <CardDescription>
                  Gerencie sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" placeholder="••••••••" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input id="confirm-password" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    A senha deve ter pelo menos 8 caracteres e incluir letras maiúsculas, 
                    minúsculas, números e caracteres especiais.
                  </p>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => {
                        toast({
                          title: "Senha atualizada",
                          description: "Sua senha foi alterada com sucesso."
                        });
                      }}
                    >
                      Alterar Senha
                    </Button>
                  </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium mb-4">Sessões Ativas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border border-border rounded-md">
                      <div>
                        <div className="font-medium">Este Dispositivo</div>
                        <div className="text-sm text-muted-foreground">Último acesso: Agora</div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Atual
                      </Badge>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          toast({
                            title: "Sessões encerradas",
                            description: "Todas as outras sessões foram encerradas com sucesso."
                          });
                        }}
                      >
                        Encerrar Outras Sessões
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
