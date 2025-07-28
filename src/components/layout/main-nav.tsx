
"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Home, AreaChart, CalendarClock, Inbox, PackageSearch, Warehouse, FileText, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Permissions } from "@/types";

const navLinks = [
    { href: "/dashboard", icon: Home, label: "Início", permission: null },
    { href: "/dashboard/analytics", icon: AreaChart, label: "Dashboard", permission: 'dashboard' },
    { href: "/dashboard/schedules", icon: CalendarClock, label: "Agendamentos", permission: 'schedules' },
    { href: "/dashboard/receiving", icon: Inbox, label: "Recebimento", permission: 'receiving' },
    { href: "/dashboard/products", icon: PackageSearch, label: "Produtos", permission: 'products' },
    { href: "/dashboard/products/management", icon: Settings, label: "Gerenciar Produtos", permission: 'productManagement' },
    { href: "/dashboard/rua08", icon: Warehouse, label: "Rua 08", permission: 'allocation' },
    { href: "/dashboard/reports", icon: FileText, label: "Relatórios", permission: 'reports' },
];

interface MainNavProps {
    permissions?: Permissions | null;
}

export function MainNav({ permissions }: MainNavProps) {
    const pathname = usePathname();

    const hasAccess = (permission: keyof Permissions | null) => {
        if (!permission) return true; // Links like "Início" are always visible
        if (!permissions) return false;
        return permissions[permission];
    }

    return (
        <nav className="flex flex-col gap-2 md:flex-row md:items-center">
            {navLinks.filter(link => hasAccess(link.permission as keyof Permissions | null)).map(({ href, icon: Icon, label }) => (
                <Button 
                    key={href} 
                    variant={pathname.startsWith(href) && href !== "/dashboard" || pathname === href ? "secondary" : "ghost"} 
                    size="sm" 
                    asChild
                    className="justify-start text-base md:text-sm"
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
