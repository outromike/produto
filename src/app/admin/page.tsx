
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Shield, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// A verificação de sessão e permissão agora é feita aqui, na página.
export default async function AdminDashboardPage() {
  const session = await getSession();

  // Se não houver sessão ou o usuário não for admin, redireciona para a página de login.
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

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
