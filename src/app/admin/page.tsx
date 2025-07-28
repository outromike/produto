
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Shield, Users } from "lucide-react";

// Esta página agora assume que o acesso já foi verificado pelo AdminLayout.
export default function AdminDashboardPage() {
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
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Adicione, remova ou edite as permissões dos usuários.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <Button asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Usuários
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
