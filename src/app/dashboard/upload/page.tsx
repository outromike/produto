import { UploadForm } from "@/components/upload/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const session = await getSession();

  if (session?.user?.username !== 'admin') {
    redirect('/dashboard/products');
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
       <Card>
        <CardHeader>
          <CardTitle>Upload de Planilhas de Produtos</CardTitle>
          <CardDescription>
            Faça o upload dos arquivos CSV para as unidades de Itajaí (ITJ) e Joinville (JVL) para atualizar a base de dados de produtos. Apenas o usuário 'admin' pode realizar esta ação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Certifique-se de que os arquivos estão no formato CSV.</li>
                        <li>O sistema identificará as colunas automaticamente com base nos cabeçalhos.</li>
                        <li>Os produtos da mesma unidade (ITJ ou JVL) no arquivo antigo serão substituídos pelos novos.</li>
                        <li>Se você enviar apenas um arquivo, os dados da outra unidade serão preservados.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <UploadForm />
        </CardContent>
      </Card>
    </main>
  );
}
