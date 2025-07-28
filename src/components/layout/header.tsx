
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PackageSearch, Menu } from "lucide-react";
import Link from "next/link";
import { MainNav } from "./main-nav";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-semibold">
          <PackageSearch className="h-6 w-6 text-primary" />
          <span className="sr-only">ELGIN APP</span>
        </Link>
        <MainNav />
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
             <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-semibold">
                <PackageSearch className="h-6 w-6 text-primary" />
                <span>ELGIN APP</span>
            </Link>
            <MainNav />
          </nav>
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserNav user={session.user} />
      </div>
    </header>
  );
}
