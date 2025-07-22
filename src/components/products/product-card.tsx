"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, Copy, Weight, Box, ScanLine, Building, Ruler, Package, Inbox } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const classificationColors = {
    A: 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:text-green-400',
    B: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:text-yellow-400',
    C: 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:text-red-400',
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="font-headline text-lg hover:text-primary">
                <Link href={`/products/${product.sku}`}>{product.description}</Link>
            </CardTitle>
            <Badge variant="outline" className={cn("whitespace-nowrap", classificationColors[product.classification])}>
                Class {product.classification}
            </Badge>
        </div>
        <CardDescription>{product.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>{product.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>{product.packaging}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            <span>{product.grossWeight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>{product.quantity} {product.measurementUnit}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ScanLine className="h-4 w-4" />
                <span>Barcode (EAN)</span>
            </div>
            <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-foreground flex-grow break-all">{product.barcode}</p>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
            <Link href={`/products/${product.sku}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
