import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PackageSearch, Upload, Table, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { User } from "@/types";
import { Button } from "../ui/button";

interface HeaderProps {
    user: User | undefined;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/products" className="flex items-center gap-2 font-headline text-lg font-semibold">
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
            <Link href="/products/table">
              <Table className="mr-2 h-4 w-4"/>
              Ver em Tabela
            </Link>
          </Button>
        {user?.username === 'admin' && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4"/>
              Upload de CSV
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <UserNav user={user} />
      </nav>
    </header>
  );
}
