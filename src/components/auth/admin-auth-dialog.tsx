
'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { verifyAdminPassword } from '@/lib/auth';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminAuthDialogProps {
  onAuthorizationSuccess: () => void;
}

export function AdminAuthDialog({ onAuthorizationSuccess }: AdminAuthDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyAdminPassword(password);
      if (result.success) {
        onAuthorizationSuccess();
      } else {
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
    });
  };

  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmação de Administrador</AlertDialogTitle>
          <AlertDialogDescription>
            Para acessar o painel, por favor, insira a senha do administrador.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Falha na Verificação</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="password">Senha de Admin</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleVerify();
                        }
                    }}
                />
            </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <Button onClick={handleVerify} disabled={isPending}>
             {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Confirmar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
