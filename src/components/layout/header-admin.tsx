
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PackageSearch, Shield } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/admin" className="flex items-center gap-2 font-headline text-lg font-semibold">
        <Shield className="h-6 w-6 text-primary" />
        <span>Painel do Administrador</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2">
        <Link href="/dashboard/products" className="flex items-center gap-2 font-semibold">
            <PackageSearch className="h-6 w-6" />
            <span>Consulta de Produtos</span>
        </Link>
        <ThemeToggle />
        <UserNav user={session?.user} />
      </nav>
    </header>
  );
}
