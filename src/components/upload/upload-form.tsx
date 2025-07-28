
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
import { uploadProducts } from "@/app/admin/upload/actions";

const formSchema = z.object({
  fileITJ: z.custom<File | undefined>().optional(),
  fileJVL: z.custom<File | undefined>().optional(),
}).refine(data => data.fileITJ || data.fileJVL, {
    message: "Pelo menos um dos arquivos deve ser enviado.",
    path: ["fileITJ"], // attach error to one of the fields
});

export function UploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    const formData = new FormData();
    if (values.fileITJ) {
      formData.append('fileITJ', values.fileITJ);
    }
    if (values.fileJVL) {
        formData.append('fileJVL', values.fileJVL);
    }

    startTransition(async () => {
      const result = await uploadProducts(formData);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="fileITJ"
            render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                <FormLabel>Arquivo CSV - Itajaí (ITJ)</FormLabel>
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
            <FormField
            control={form.control}
            name="fileJVL"
            render={({ field: { onChange, value, ...rest }}) => (
                <FormItem>
                <FormLabel>Arquivo CSV - Joinville (JVL)</FormLabel>
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
        </div>
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : "Enviar Arquivos e Atualizar Base"}
        </Button>
      </form>
    </Form>
  );
}
