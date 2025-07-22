import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
