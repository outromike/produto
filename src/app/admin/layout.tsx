
import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  // A verificação de 'admin' será feita na página específica
  // para evitar loops de redirecionamento e problemas de acesso.

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session.user} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
