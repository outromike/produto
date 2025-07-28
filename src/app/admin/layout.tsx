import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";

// Este layout apenas monta a estrutura visual do painel de admin.
// A proteção agora é feita com um popup de senha na página.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* O cabeçalho ainda pode precisar dos dados do usuário se estiver logado */}
      <Header user={session?.user} />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
