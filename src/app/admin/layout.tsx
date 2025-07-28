
import { Header } from "@/components/layout/header-admin";
import { getSession } from "@/lib/auth";

// Este layout agora é apenas um componente visual e não lida mais com
// a lógica de proteção, que foi movida para cada página individualmente.
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
