// src/app/admin/upload/devolucao/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DevolucaoUploadForm } from "@/components/upload/devolucao-upload-form";


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
            Faça o upload do arquivo CSV para criar ou atualizar os agendamentos de devolução.
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
                        <li>O sistema irá adicionar os novos agendamentos ao arquivo existente.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <DevolucaoUploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
