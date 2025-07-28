
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
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from '@/app/admin/users/actions';

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

  const handleUserSaved = (user: User) => {
    if (selectedUser) {
      // Edit
      setUsers(users.map(u => (u.username === user.username ? user : u)));
    } else {
      // Add
      setUsers([...users, user]);
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
                    <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-primary/20 text-primary-foreground' : 'bg-muted'}`}>
                      {user.role}
                    </span>
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
