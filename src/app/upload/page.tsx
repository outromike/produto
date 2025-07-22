import { UploadForm } from "@/components/upload/upload-form";
import { FileUp } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
      <div className="flex flex-col items-center text-center mb-8">
        <FileUp className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-headline font-bold">Upload Product Data</h1>
        <p className="text-muted-foreground mt-2">
          Upload your `Cad_ITJ.csv` and `Cad_JVL.csv` files to update the product database.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
