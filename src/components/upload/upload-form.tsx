// src/components/upload/upload-form.tsx
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadProducts } from "@/app/upload/actions";
import { useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  itjFile: z.any().optional(),
  jvlFile: z.any().optional(),
}).refine(data => data.itjFile?.length > 0 || data.jvlFile?.length > 0, {
    message: "Por favor, envie pelo menos um arquivo.",
    path: ["itjFile"], 
});


export function UploadForm() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itjFile: undefined,
      jvlFile: undefined,
    },
  });

  const itjFileRef = form.register("itjFile");
  const jvlFileRef = form.register("jvlFile");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    const formData = new FormData();
    if (values.itjFile?.[0]) {
      formData.append('itjFile', values.itjFile[0]);
    }
    if (values.jvlFile?.[0]) {
      formData.append('jvlFile', values.jvlFile[0]);
    }

    startTransition(async () => {
      const uploadResult = await uploadProducts(formData);
      setResult(uploadResult);
      if (uploadResult.success) {
        form.reset();
        setTimeout(() => {
            router.push('/products');
        }, 2000); // Wait 2 seconds before redirecting
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {result && (
            <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "bg-green-500/10 border-green-500/30" : ""}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Sucesso!" : "Falha no Upload"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
            </Alert>
        )}
        <FormField
          control={form.control}
          name="itjFile"
          render={() => (
            <FormItem>
              <FormLabel>Arquivo CSV - Unidade Itajaí (ITJ)</FormLabel>
              <FormControl>
                <Input type="file" accept=".csv" {...itjFileRef} />
              </FormControl>
              <FormDescription>
                Selecione o arquivo CSV correspondente à unidade de Itajaí.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jvlFile"
          render={() => (
            <FormItem>
              <FormLabel>Arquivo CSV - Unidade Joinville (JVL)</FormLabel>
              <FormControl>
                 <Input type="file" accept=".csv" {...jvlFileRef} />
              </FormControl>
               <FormDescription>
                Selecione o arquivo CSV correspondente à unidade de Joinville.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Enviando..." : "Enviar Arquivos e Atualizar Produtos"}
        </Button>
      </form>
    </Form>
  );
}
