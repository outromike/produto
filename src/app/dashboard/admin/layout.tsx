
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user?.role !== 'admin') {
    // Redireciona para uma página de acesso negado ou para a home do dashboard
    redirect('/dashboard/products');
  }

  return <>{children}</>;
}
