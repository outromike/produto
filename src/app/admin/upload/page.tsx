
import { UploadForm } from "@/components/upload/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UploadPage() {
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
          <CardTitle>Upload de Arquivos</CardTitle>
          <CardDescription>
            Faça o upload dos arquivos CSV para atualizar a base de dados de produtos ou agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções para Produtos</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Certifique-se de que os arquivos de produtos estão no formato CSV.</li>
                        <li>Os produtos da mesma unidade (ITJ ou JVL) no arquivo antigo serão substituídos pelos novos.</li>
                        <li>Se você enviar apenas um arquivo de produto, os dados da outra unidade serão preservados.</li>
                    </ul>
                </AlertDescription>
            </Alert>
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções para Agendamentos</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                         <li>Envie o arquivo de agendamentos de devolução em formato CSV.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <UploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
