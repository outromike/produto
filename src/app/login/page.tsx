import { LoginForm } from "@/components/auth/login-form";
import { PackageSearch } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center justify-center gap-2">
            <PackageSearch className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-headline font-bold">Consulta de Produtos</h1>
            <p className="text-muted-foreground">Faça login para acessar o banco de dados de produtos</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
