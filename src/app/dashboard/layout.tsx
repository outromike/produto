
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import type { User } from "@/types";

// Este layout protege TODAS as rotas dentro de /dashboard
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Se não houver sessão ou usuário na sessão, redireciona para a página de login.
  if (!session.user) {
    redirect('/login');
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session.user} />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
