"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { uploadFiles } from "@/app/upload/actions";
import { Card, CardContent } from "../ui/card";

const formSchema = z.object({
  itjFile: z.any().optional(),
  jvlFile: z.any().optional(),
}).refine(data => (data.itjFile && data.itjFile.length > 0) || (data.jvlFile && data.jvlFile.length > 0), {
    message: "Please upload at least one file.",
    path: ["itjFile"], // Show error under the first field
});


export function UploadForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itjFile: undefined,
      jvlFile: undefined,
    },
  });

  const itjFileRef = form.register("itjFile");
  const jvlFileRef = form.register("jvlFile");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setResult(null);
    const formData = new FormData();
    if (values.itjFile?.[0]) {
      formData.append("itjFile", values.itjFile[0]);
    }
    if (values.jvlFile?.[0]) {
      formData.append("jvlFile", values.jvlFile[0]);
    }

    startTransition(async () => {
      const response = await uploadFiles(formData);
      setResult(response);
      if (response.success) {
        form.reset();
      }
    });
  };

  return (
     <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {result?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
            {result?.success && (
              <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Upload Successful</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-300">{result.success}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="itjFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itajaí Data (Cad_ITJ.csv)</FormLabel>
                  <FormControl>
                    <Input type="file" accept=".csv" {...itjFileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jvlFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joinville Data (Cad_JVL.csv)</FormLabel>
                  <FormControl>
                     <Input type="file" accept=".csv" {...jvlFileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Uploading..." : "Upload Files"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
