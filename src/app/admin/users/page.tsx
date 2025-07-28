
import { getAllUsers } from "./actions";
import { UserManagementClient } from "@/components/admin/user-management-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function UserManagementPage() {
  const users = await getAllUsers();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
       <div className="mb-6 flex items-center gap-4">
        <Users className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-headline font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova usuários do sistema.</p>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários cadastrados na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UserManagementClient initialUsers={users} />
        </CardContent>
      </Card>
    </main>
  );
}
