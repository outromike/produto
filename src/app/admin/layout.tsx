
import { Header } from "@/components/layout/header-admin";
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

// Este layout protege TODAS as rotas dentro de /admin
// A verificação de autorização é feita aqui.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Se não houver usuário logado ou se o usuário não for 'admin',
  // redireciona para a página principal do dashboard.
  if (!session.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
