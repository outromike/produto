"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadReturnSchedules } from "./actions";
import { useRouter } from "next/navigation";

// Define o schema do formulário com Zod
const formSchema = z.object({
  fileAgendamento: z.custom<File>().refine(file => file instanceof File && file.size > 0, {
    message: "O arquivo CSV é obrigatório.",
  })
});

// O componente da página agora é um Client Component único que contém o formulário
export default function UploadDevolucaoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    const formData = new FormData();
    if (values.fileAgendamento) {
      formData.append('fileAgendamento', values.fileAgendamento);
    }
    
    startTransition(async () => {
      const result = await uploadReturnSchedules(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        // Redirecionamento via cliente em caso de sucesso, para maior robustez
        router.push('/admin');
        router.refresh(); // Opcional: força a atualização dos dados na página de admin
      }
    });
  }
  
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
                        <li>Certifique-se de que o arquivo está no formato CSV.</li>
                        <li>O sistema identificará as colunas automaticamente com base nos cabeçalhos.</li>
                        <li>O arquivo de agendamentos existente será substituído pelo novo.</li>
                    </ul>
                </AlertDescription>
            </Alert>
            {/* O formulário agora está diretamente integrado aqui */}
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
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : "Enviar Arquivo"}
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </main>
  );
}
