
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard/products');
  }

  return <>{children}</>;
}
