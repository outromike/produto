
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { uploadReturnSchedules } from "@/app/admin/upload/devolucao/actions";

const formSchema = z.object({
  fileAgendamento: z.any().refine((file) => file instanceof File && file.size > 0, "O arquivo CSV é obrigatório."),
});

export function DevolucaoUploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    const formData = new FormData();
    formData.append('fileAgendamento', values.fileAgendamento);

    startTransition(async () => {
      const result = await uploadReturnSchedules(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
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
            render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                <FormLabel>Arquivo CSV - Agendamentos</FormLabel>
                <FormControl>
                    <Input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...rest}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : "Enviar Arquivo e Atualizar"}
        </Button>
      </form>
    </Form>
  );
}
