
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="mx-auto max-w-md w-full animate-scale-in">
        <CardHeader className="text-center pb-2">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-2 animate-pulse-gentle" />
          <CardTitle className="text-3xl">Página não encontrada</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-muted-foreground">
            A página que você está procurando não foi encontrada ou não existe.
          </p>
          <p className="text-sm text-muted-foreground">
            Verifique se o endereço está correto ou volte para a página inicial.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
