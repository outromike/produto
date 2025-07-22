
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  itjFile: z.any().optional(),
  jvlFile: z.any().optional(),
}).refine(data => (data.itjFile && data.itjFile.length > 0) || (data.jvlFile && data.jvlFile.length > 0), {
    message: "Please upload at least one file.",
    path: ["itjFile"], // Show error under the first field
});


export function UploadForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
    setError(null);
    const formData = new FormData();
    if (values.itjFile?.[0]) {
      formData.append("itjFile", values.itjFile[0]);
    }
    if (values.jvlFile?.[0]) {
      formData.append("jvlFile", values.jvlFile[0]);
    }

    startTransition(async () => {
      const response = await uploadFiles(formData);
      if (response.error) {
        setError(response.error);
      }
      if (response.success) {
        toast({
            title: "Upload Successful!",
            description: "The product list has been updated.",
            variant: "default",
        })
        router.push('/products');
        router.refresh(); // Forces a refresh of the server-side data
      }
    });
  };

  return (
     <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
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
              {isPending ? "Uploading..." : "Upload Files & View Products"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
