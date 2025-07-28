
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';

// Este layout protege TODAS as rotas dentro de /dashboard
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Se não houver sessão, redireciona para a página de login.
  if (!session?.user) {
    redirect('/login');
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
