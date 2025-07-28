
import { getSession } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getSession();
    
    if (!session.user) {
        redirect('/login');
    }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
        <div className="mb-8 flex items-center gap-4">
             <UserCircle className="h-10 w-10 text-primary" />
             <div>
                <h1 className="text-3xl font-headline font-bold">Meu Perfil</h1>
                <p className="text-muted-foreground">Atualize suas informações pessoais e senha.</p>
            </div>
        </div>
       <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Gerencie seu nome, e-mail e altere sua senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={session.user} />
        </CardContent>
      </Card>
    </main>
  );
}
