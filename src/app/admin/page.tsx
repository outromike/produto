
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Shield, Users } from "lucide-react";
import { useSession } from '@/hooks/use-session';
import { AdminAuthDialog } from '@/components/auth/admin-auth-dialog';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { session, isLoading } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  // Efeito para verificar o status de autorização quando a sessão carregar
  useEffect(() => {
    if (!isLoading) {
      if (!session?.user) {
        router.push('/login'); // Se não há sessão, vai para o login
        return;
      }
      // Se já foi autorizado nesta sessão, não precisa fazer nada.
      // A autorização é controlada pelo estado `isAuthorized`.
    }
  }, [session, isLoading, router]);

  const handleAuthorizationSuccess = () => {
    setIsAuthorized(true);
  };

  // Se a sessão está carregando, não mostra nada para evitar piscar a tela
  if (isLoading) {
    return null;
  }
  
  // Se o usuário não está logado ou não é admin, mostra o diálogo de autorização
  if (!isAuthorized) {
    if (session?.user?.role !== 'admin') {
       return (
        <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6 text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Acesso Negado</CardTitle>
                    <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/products">Voltar aos Produtos</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
      );
    }
    return <AdminAuthDialog onAuthorizationSuccess={handleAuthorizationSuccess} />;
  }

  // Se autorizado, mostra o conteúdo do painel de admin
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Painel do Administrador</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                Ir para Upload de CSV
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Adicione, remova ou edite as permissões dos usuários do sistema. (Funcionalidade futura)
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
