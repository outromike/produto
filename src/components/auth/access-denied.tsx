
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

export function AccessDenied() {
  return (
    <main className="container flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Lock className="h-8 w-8" />
            </div>
          <CardTitle className="mt-4 text-2xl font-bold">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página. Por favor, contate o administrador do sistema se você acredita que isso é um erro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Voltar para o Início</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
