
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { verifyAdminPassword } from "@/lib/auth";

export function AdminAuthDialog() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePasswordCheck = () => {
    setError("");
    startTransition(async () => {
      const { success } = await verifyAdminPassword(password);
      if (success) {
        // Upon success, the server action sets a cookie.
        // We just need to refresh the page to let the layout re-evaluate access.
        router.refresh();
      } else {
        setError("Senha incorreta. Tente novamente.");
      }
    });
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
          <AlertDialogDescription>
            Para acessar o painel de administrador, por favor, insira a senha de acesso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha do Administrador</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordCheck();
              }}
            />
          </div>
        </div>
        <AlertDialogFooter>
           <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Voltar
          </Button>
          <Button onClick={handlePasswordCheck} disabled={isPending}>
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Acessar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
