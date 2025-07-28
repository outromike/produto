
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { User } from "@/types";
import { updateUserInfo, changePassword } from "@/app/dashboard/profile/actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const userInfoSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As novas senhas não coincidem.",
  path: ["confirmPassword"],
});

type UserInfoFormValues = z.infer<typeof userInfoSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInfoPending, startInfoTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const infoForm = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onInfoSubmit = (values: UserInfoFormValues) => {
    startInfoTransition(async () => {
        const result = await updateUserInfo(user.username, values);
        if (result.success) {
            toast({ title: "Sucesso!", description: "Suas informações foram atualizadas." });
            router.refresh(); // Refresh to update header
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    startPasswordTransition(async () => {
        const result = await changePassword(user.username, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        });
        if (result.success) {
            toast({ title: "Sucesso!", description: "Sua senha foi alterada." });
            passwordForm.reset();
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  return (
    <div className="space-y-8">
      <Form {...infoForm}>
        <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-4">
          <FormField
            control={infoForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl><Input placeholder="Seu nome" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={infoForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isInfoPending}>
                 {isInfoPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Informações
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium">Alterar Senha</h3>
             <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="flex justify-end">
                <Button type="submit" variant="secondary" disabled={isPasswordPending}>
                     {isPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Alterar Senha
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
