

import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PackageSearch, Table, LayoutDashboard, CalendarClock } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "../ui/button";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/dashboard/products" className="flex items-center gap-2 font-headline text-lg font-semibold">
        <PackageSearch className="h-6 w-6 text-primary" />
        <span>Consulta de Produtos</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2">
         <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4"/>
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/schedules">
              <CalendarClock className="mr-2 h-4 w-4"/>
              Agendamentos
            </Link>
          </Button>
        <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products/table">
              <Table className="mr-2 h-4 w-4"/>
              Ver em Tabela
            </Link>
          </Button>
        <ThemeToggle />
        <UserNav user={session?.user} />
      </nav>
    </header>
  );
}
