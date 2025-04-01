import { useState } from 'react';
import { testConnection } from '@/lib/services/emailClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EmailTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const success = await testConnection();
      setResult({
        success,
        message: success 
          ? 'Conexão com o servidor de email estabelecida com sucesso'
          : 'Erro ao conectar com o servidor de email'
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao testar conexão com o servidor de email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Conexão com Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
        >
          {isLoading ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        {result && (
          <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {result.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 