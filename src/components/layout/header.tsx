
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { MainNav } from "./main-nav";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/dashboard/products" className="flex items-center gap-2 font-headline text-lg font-semibold">
        <PackageSearch className="h-6 w-6 text-primary" />
        <span>Consulta de Produtos</span>
      </Link>
      
      {/* Navegação principal visível em telas maiores */}
      <div className="hidden flex-1 md:flex md:items-center md:justify-end">
        <MainNav />
      </div>

      <nav className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserNav user={session?.user} />
      </nav>
    </header>
  );
}
