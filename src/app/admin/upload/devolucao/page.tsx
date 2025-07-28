
'use client';

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadReturnSchedules } from "./actions";

const devolucaoFormSchema = z.object({
  fileAgendamento: z.instanceof(File).refine(file => file.size > 0, "O arquivo CSV é obrigatório."),
});

type DevolucaoFormValues = z.infer<typeof devolucaoFormSchema>;

function DevolucaoUploadForm() {
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
      }
    });
  };

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
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : "Enviar Arquivo"}
        </Button>
      </form>
    </Form>
  );
}

export default function UploadDevolucaoPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel do Admin
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload de Agendamento de Devolução</CardTitle>
          <CardDescription>
            Faça o upload do arquivo CSV para agendar as devoluções.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>O arquivo deve estar no formato CSV.</li>
                        <li>Qualquer arquivo com este formato será aceito.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <DevolucaoUploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
