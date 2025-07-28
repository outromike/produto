import { Header } from "@/components/layout/header-admin";

// Este layout apenas monta a estrutura visual do painel de admin.
// A proteção agora é feita com um popup de senha na página.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* O cabeçalho agora busca a sessão internamente */}
      <Header />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
