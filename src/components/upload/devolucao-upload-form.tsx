"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { uploadReturnSchedules } from "@/app/admin/actions";
import { AlertCircle, Info, Loader2 } from "lucide-react";

const devolucaoFormSchema = z.object({
  fileAgendamento: z.any().refine((file) => file instanceof File && file.size > 0, "O arquivo CSV é obrigatório."),
});

type DevolucaoFormValues = z.infer<typeof devolucaoFormSchema>;

interface DevolucaoUploadFormProps {
  setOpen: (open: boolean) => void;
}

export function DevolucaoUploadForm({ setOpen }: DevolucaoUploadFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DevolucaoFormValues>({
    resolver: zodResolver(devolucaoFormSchema),
  });

  const onSubmit = (values: DevolucaoFormValues) => {
    setError(null);
    const formData = new FormData();
    formData.append('fileAgendamento', values.fileAgendamento);

    startTransition(async () => {
      const result = await uploadReturnSchedules(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        // Sucesso - fecha o dialog
        setOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Instruções</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 mt-2">
            <li>O arquivo deve estar no formato CSV.</li>
            <li>Qualquer arquivo com este formato será aceito.</li>
          </ul>
        </AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Falha no Upload</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="fileAgendamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arquivo CSV - Agendamentos</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
                <Button variant="outline" disabled={isPending}>Cancelar</Button>
            </AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : "Enviar Arquivo"}
            </Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </div>
  );
}