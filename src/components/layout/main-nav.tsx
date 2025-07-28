
"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { LayoutDashboard, CalendarClock, Inbox, Table } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/schedules", icon: CalendarClock, label: "Agendamentos" },
    { href: "/dashboard/receiving", icon: Inbox, label: "Recebimento" },
    { href: "/dashboard/products/table", icon: Table, label: "Ver em Tabela" },
];

export function MainNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-2">
            {navLinks.map(({ href, icon: Icon, label }) => (
                <Button 
                    key={href} 
                    variant={pathname === href ? "secondary" : "outline"} 
                    size="sm" 
                    asChild
                >
                    <Link href={href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                    </Link>
                </Button>
            ))}
        </nav>
    );
}
