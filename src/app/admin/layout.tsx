
import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { SessionPayload } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Proteção centralizada: Se não houver sessão ou o usuário não for admin,
  // redireciona para a página de produtos.
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard/products');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session.user} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
