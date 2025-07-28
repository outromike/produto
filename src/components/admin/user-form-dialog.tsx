
"use client";

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Permissions } from '@/types';
import { addUser, updateUser } from '@/app/admin/users/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

interface UserFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User | null;
  onUserSaved: (user: User) => void;
}

const permissionsSchema = z.object({
  schedules: z.boolean().default(false),
  products: z.boolean().default(false),
  productManagement: z.boolean().default(false),
  receiving: z.boolean().default(false),
  conference: z.boolean().default(false),
  allocation: z.boolean().default(false),
  dashboard: z.boolean().default(false),
  reports: z.boolean().default(false),
});

const formSchema = z.object({
  username: z.string().min(3, { message: "O nome de usuário deve ter pelo menos 3 caracteres." }),
  name: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }).optional().or(z.literal('')),
  password: z.string().optional(),
  role: z.enum(['user', 'admin'], { required_error: "A permissão é obrigatória." }),
  permissions: permissionsSchema,
});

type FormValues = z.infer<typeof formSchema>;

const permissionLabels: { id: keyof Permissions; label: string; description: string }[] = [
    { id: 'dashboard', label: 'Dashboard de Análise', description: 'Permite visualizar a página principal de análises do estoque.' },
    { id: 'products', label: 'Consulta de Produtos', description: 'Permite visualizar e pesquisar na base de produtos.' },
    { id: 'productManagement', label: 'Gerenciar Produtos', description: 'Permite criar, editar e excluir produtos.' },
    { id: 'schedules', label: 'Gerenciar Agendamentos', description: 'Permite criar, editar e excluir agendamentos de devolução.' },
    { id: 'receiving', label: 'Acessar Recebimento', description: 'Permite visualizar os cards de recebimento e iniciar uma conferência.' },
    { id: 'conference', label: 'Executar Conferência', description: 'Permite registrar produtos, avarias e divergências.' },
    { id: 'allocation', label: 'Alocar na Rua 08', description: 'Permite alocar os produtos recebidos nas posições do estoque.' },
    { id: 'reports', label: 'Baixar Relatórios', description: 'Permite exportar os dados do sistema em formato Excel.' },
];

export function UserFormDialog({ isOpen, setIsOpen, user, onUserSaved }: UserFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isEditMode = !!user;

  const defaultPermissions = {
    schedules: false, products: false, receiving: false,
    conference: false, allocation: false, dashboard: false, reports: false,
    productManagement: false,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        permissions: defaultPermissions
    }
  });
  
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role,
        permissions: { ...defaultPermissions, ...user.permissions }
      });
    } else {
      form.reset({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'user',
        permissions: defaultPermissions
      });
    }
  }, [user, isOpen, form]);

  const role = form.watch('role');
  
  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
        let result;
        const finalValues = { ...values };
        if (finalValues.role === 'admin') {
            finalValues.permissions = {
                schedules: true, products: true, receiving: true,
                conference: true, allocation: true, dashboard: true, reports: true,
                productManagement: true
            };
        }

        if (isEditMode) {
            const updateData: Partial<User> = {
                name: finalValues.name,
                email: finalValues.email,
                role: finalValues.role,
                permissions: finalValues.permissions,
            };
            if (finalValues.password && finalValues.password.trim() !== '') {
                updateData.password = finalValues.password;
            }
            result = await updateUser(user.username, updateData);
            if (result.success) onUserSaved({ ...user, ...updateData });
        } else {
            if (!finalValues.password || finalValues.password.trim() === '') {
                form.setError("password", { message: "A senha é obrigatória para novos usuários."});
                return;
            }
            result = await addUser(finalValues as Omit<User, 'password'> & { password: string });
            if (result.success) onUserSaved(finalValues as User);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Alterando dados para ${user?.username}. Deixe a senha em branco para não a alterar.` : 'Preencha os campos para criar uma nova conta.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl><Input type="password" placeholder={isEditMode ? 'Deixe em branco para não alterar' : '••••••••'} {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
             </div>
            
             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissão Geral</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={user?.username === 'admin'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a permissão" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {role === 'user' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <FormLabel>Permissões Específicas do Módulo</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md border p-4">
                    {permissionLabels.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name={`permissions.${item.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{item.label}</FormLabel>
                              <FormDescription>
                                {item.description}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

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
