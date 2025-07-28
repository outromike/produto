
"use client";

import { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserFormDialog } from './user-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from '@/app/admin/users/actions';
import { Badge } from '../ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserManagementClientProps {
  initialUsers: User[];
}

export function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (user: User | null = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleOpenDeleteAlert = (user: User) => {
    setUserToDelete(user);
    setIsDeleteAlertOpen(true);
  };

  const handleUserSaved = (savedUser: User) => {
    if (selectedUser) {
      // Edit
      setUsers(users.map(u => (u.username === savedUser.username ? savedUser : u)));
    } else {
      // Add
      setUsers([...users, savedUser]);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    const result = await deleteUser(userToDelete.username);
    if (result.success) {
      toast({ title: "Sucesso!", description: "Usuário excluído com sucesso." });
      setUsers(users.filter(u => u.username !== userToDelete.username));
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    }
    setIsSubmitting(false);
    setIsDeleteAlertOpen(false);
    setUserToDelete(null);
  };
  

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell className="font-mono">{user.username}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="cursor-pointer">
                                  {user.role === 'admin' && <KeyRound className="mr-1 h-3 w-3" />}
                                  {user.role}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='text-sm font-medium mb-2'>Permissões:</p>
                                {user.role === 'admin' ? <p className='text-xs'>Acesso total a todos os módulos.</p> : (
                                    <ul className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs'>
                                        {Object.entries(user.permissions || {}).map(([key, value]) => (
                                           <li key={key} className={`${value ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{key}</li>
                                        ))}
                                    </ul>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteAlert(user)}
                      disabled={user.username === 'admin'}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        user={selectedUser}
        onUserSaved={handleUserSaved}
      />
      
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário 
              <span className="font-bold"> {userToDelete?.username}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
