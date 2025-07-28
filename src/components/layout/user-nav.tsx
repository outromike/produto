
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionPayload } from "@/types";
import { logout } from "@/app/login/actions";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import { useTransition } from "react";
import Link from "next/link";

interface UserNavProps {
    user: SessionPayload['user'] | undefined;
}

export function UserNav({ user }: UserNavProps) {
    const [isPending, startTransition] = useTransition();
    
    const handleLogout = () => {
        startTransition(async () => {
            await logout();
        });
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Logado como</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.username} ({user?.role})
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           {user?.role === 'admin' && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin">
                <Shield className="mr-2 h-4 w-4" />
                <span>Painel do Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout();}} disabled={isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
