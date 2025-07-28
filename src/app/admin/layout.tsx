
import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { SessionPayload } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A verificação de sessão e permissão foi movida para a página 
  // para evitar problemas de redirecionamento.
  // Este layout agora apenas fornece a estrutura visual.
  const session = await getSession();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session?.user as SessionPayload['user']} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
