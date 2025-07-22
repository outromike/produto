import { getProductBySku } from "@/lib/products";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Building, Box, Weight, Rulers, ScanLine, Tag } from "lucide-react";
import { AiSuggestions } from "@/components/products/ai-suggestions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProductDetailPage({ params }: { params: { sku: string } }) {
  const product = await getProductBySku(params.sku);

  if (!product) {
    notFound();
  }

  const classificationColors = {
    A: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400',
    B: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400',
    C: 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400',
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/products">← Back to all products</Link>
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-2xl font-headline">{product.description}</CardTitle>
                <Badge variant="outline" className={cn("whitespace-nowrap text-base", classificationColors[product.classification])}>
                    Class {product.classification}
                </Badge>
              </div>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium"><Tag className="inline-block mr-2 h-4 w-4 text-muted-foreground" />SKU</TableCell>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><ScanLine className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Barcode (EAN)</TableCell>
                    <TableCell className="font-mono">{product.barcode}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><Building className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Unit</TableCell>
                    <TableCell>{product.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><Box className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Packaging</TableCell>
                    <TableCell>{product.packaging}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><Weight className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Weight</TableCell>
                    <TableCell>{product.weight} kg</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium"><Rulers className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Dimensions</TableCell>
                    <TableCell>{product.dimensions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium"><Rulers className="inline-block mr-2 h-4 w-4 text-muted-foreground" />Volume</TableCell>
                    <TableCell>{product.volume} m³</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <AiSuggestions product={product} />
        </div>
      </div>
    </div>
  );
}
