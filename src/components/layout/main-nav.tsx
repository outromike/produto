
"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Home, AreaChart, CalendarClock, Inbox, PackageSearch } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/dashboard", icon: Home, label: "Início" },
    { href: "/dashboard/analytics", icon: AreaChart, label: "Dashboard" },
    { href: "/dashboard/schedules", icon: CalendarClock, label: "Agendamentos" },
    { href: "/dashboard/receiving", icon: Inbox, label: "Recebimento" },
    { href: "/dashboard/products", icon: PackageSearch, label: "Produtos" },
];

export function MainNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-2">
            {navLinks.map(({ href, icon: Icon, label }) => (
                <Button 
                    key={href} 
                    variant={pathname === href ? "secondary" : "ghost"} 
                    size="sm" 
                    asChild
                    className="justify-start"
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
