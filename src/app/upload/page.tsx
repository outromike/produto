import { UploadForm } from "@/components/upload/upload-form";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <UploadCloud className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Upload de Arquivos de Produtos</h1>
        <p className="max-w-md text-muted-foreground">
          Envie seus arquivos CSV para atualizar a base de dados de produtos. O sistema irá processar os arquivos e atualizar a lista de produtos exibida no aplicativo.
        </p>
      </div>
      <div className="mt-8">
        <UploadForm />
      </div>
    </main>
  );
}
