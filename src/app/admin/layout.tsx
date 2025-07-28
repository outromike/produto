
import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";

// Este layout apenas monta a estrutura visual do painel de admin.
// A proteção agora é feita diretamente na página com um diálogo de senha.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header user={session?.user} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
