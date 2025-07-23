"use client";

import { useState } from 'react';
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductSuggestions, ProductSuggestionsOutput } from '@/ai/flows/product-suggestions';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';

interface AiSuggestionsProps {
    product: Product;
    allProducts: Product[];
}

export function AiSuggestions({ product, allProducts }: AiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<ProductSuggestionsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);
        try {
            const result = await getProductSuggestions({
                productDescription: product.description,
                productCategory: product.category,
                productUnit: product.unit,
                allProducts: allProducts,
            });
            setSuggestions(result);
        } catch (err) {
            setError("Falha ao obter sugestões de IA. Por favor, tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="sticky top-20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-400" />
                    <CardTitle className="font-headline">Sugestões da IA</CardTitle>
                </div>
                <CardDescription>
                    Encontre produtos similares ou alternativos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleGetSuggestions} disabled={isLoading || allProducts.length === 0} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Analisando..." : "Obter Sugestões"}
                </Button>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                {suggestions && (
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                        {suggestions.suggestions.length > 0 ? (
                            <>
                                <h4 className="font-semibold text-foreground">Alternativas Recomendadas:</h4>
                                <ul className="list-disc space-y-1 pl-5 text-sm">
                                    {suggestions.suggestions.map((s) => (
                                        <li key={s.sku}>
                                            <Link href={`/dashboard/products/${s.sku}`} className="text-muted-foreground hover:text-primary hover:underline underline-offset-4">
                                                {s.description} (SKU: {s.sku})
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                             <Alert>
                                <AlertTitle>Nenhuma correspondência direta encontrada.</AlertTitle>
                                <AlertDescription className="mt-2">
                                    <p className="font-semibold">Opções de pesquisa alternativas:</p>
                                    <p>{suggestions.alternativeSearchOptions}</p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
