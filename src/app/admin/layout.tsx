import { Header } from "@/components/layout/header-admin";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Este layout protege TODAS as rotas dentro de /admin
// A verificação de autorização é feita aqui.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const adminAuthCookie = cookieStore.get('admin-authorized');

  // Se o cookie de autorização do admin não existir ou não for válido,
  // redireciona para a página de autenticação de admin.
  if (adminAuthCookie?.value !== 'true') {
    redirect('/admin/auth');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
