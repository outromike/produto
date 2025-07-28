"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Shield, Users, Loader2, AlertCircle, FileClock, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyAdminPassword } from "@/lib/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Tenta verificar se a autorização já foi concedida na sessão do navegador.
    if (sessionStorage.getItem("admin-authorized") === "true") {
      setIsAuthorized(true);
      setShowPasswordDialog(false);
    }
  }, []);

  const handlePasswordCheck = async () => {
    setIsVerifying(true);
    setAuthError("");
    try {
      const { success } = await verifyAdminPassword(password);
      if (success) {
        sessionStorage.setItem("admin-authorized", "true");
        setIsAuthorized(true);
        setShowPasswordDialog(false);
      } else {
        setAuthError("Senha incorreta. Tente novamente.");
      }
    } catch (err) {
      setAuthError("Ocorreu um erro ao verificar a senha.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAuthorized) {
    return (
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
            <AlertDialogDescription>
              Para acessar o painel de administrador, por favor, insira a senha de acesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
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
                  if (e.key === 'Enter') {
                    handlePasswordCheck();
                  }
                }}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">Voltar</Link>
            </Button>
            <Button onClick={handlePasswordCheck} disabled={isVerifying}>
              {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Acessar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Painel do Administrador</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Produtos</CardTitle>
            <CardDescription>
              Faça o upload de novas planilhas de produtos para atualizar a base de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload de Produtos
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
              <CardTitle>Agendamento de Devolução</CardTitle>
              <CardDescription>
                Faça o upload da planilha de agendamentos de devolução.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Button asChild>
                  <Link href="/admin/upload/devolucao">
                    <FileClock className="mr-2 h-4 w-4" />
                    Agendar Devoluções
                  </Link>
              </Button>
            </CardContent>
          </Card>
        
        <Card>
           <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Adicione, remova ou edite as permissões dos usuários. (Funcionalidade futura)
            </CardDescription>
          </CardHeader>
           <CardContent>
            <Button disabled>
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Usuários
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}