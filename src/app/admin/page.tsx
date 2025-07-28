
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Shield, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();

  // 1. Redireciona para o login se não houver sessão
  if (!session?.user) {
    redirect('/login');
  }

  // 2. Verifica se o usuário tem a permissão de admin
  if (session.user.role !== 'admin') {
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

  // 3. Se for admin, mostra o conteúdo do painel
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
