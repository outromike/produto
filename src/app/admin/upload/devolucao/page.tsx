
import { DevolucaoUploadForm } from "@/components/upload/devolucao-upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UploadDevolucaoPage() {
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
                        <li>O sistema aceitará qualquer arquivo CSV por enquanto.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <DevolucaoUploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
