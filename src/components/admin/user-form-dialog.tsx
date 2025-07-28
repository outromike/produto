
"use client";

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types';
import { addUser, updateUser } from '@/app/admin/users/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface UserFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
  onUserSaved: (user: User) => void;
}

const formSchema = z.object({
  username: z.string().min(3, { message: "O nome de usuário deve ter pelo menos 3 caracteres." }),
  name: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }).optional().or(z.literal('')),
  password: z.string().optional(),
  role: z.enum(['user', 'admin'], { required_error: "A permissão é obrigatória." }),
});

type FormValues = z.infer<typeof formSchema>;

export function UserFormDialog({ isOpen, setIsOpen, user, onUserSaved }: UserFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isEditMode = !!user;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        name: user.name || '',
        email: user.email || '',
        password: '', // Password is not fetched, leave blank for editing
        role: user.role,
      });
    } else {
      form.reset({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
  }, [user, form.reset]);
  
  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      let result;
      if (isEditMode) {
        // Build the update payload, excluding empty password
        const updateData: Partial<User> = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        if (values.password && values.password.trim() !== '') {
          updateData.password = values.password;
        }
        result = await updateUser(user.username, updateData);
        if (result.success) onUserSaved({ ...user, ...updateData });
      } else {
        if (!values.password || values.password.trim() === '') {
            form.setError("password", { message: "A senha é obrigatória para novos usuários."});
            return;
        }
        result = await addUser(values as User);
        if (result.success) onUserSaved(values as User);
      }

      if (result.success) {
        toast({ title: "Sucesso!", description: `Usuário ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.` });
        setIsOpen(false);
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Alterando dados para ${user?.username}. Deixe a senha em branco para não a alterar.` : 'Preencha os campos para criar uma nova conta.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl><Input {...field} disabled={isEditMode} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl><Input placeholder="Nome completo do usuário" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl><Input type="password" placeholder={isEditMode ? 'Deixe em branco para não alterar' : '••••••••'} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={user?.username === 'admin'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a permissão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
