"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Warehouse, PackageCheck, Trash2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardData {
    totalPositions: number;
    occupiedPositions: number;
    availablePositions: number;
    occupationRate: number;
    goodProductsPositions: number;
    discardPositions: number;
}

interface DashboardClientProps {
  data: DashboardData;
}

export function DashboardClient({ data }: DashboardClientProps) {
    const {
        totalPositions,
        occupiedPositions,
        availablePositions,
        occupationRate,
        goodProductsPositions,
        discardPositions,
    } = data;
    
    const occupationColor = occupationRate > 90 ? "bg-red-500" : occupationRate > 75 ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-6 text-3xl font-headline font-bold">Dashboard - Estoque Rua 08</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-lg">Armazenagem</CardTitle>
                    <CardDescription>Ocupação geral do estoque</CardDescription>
                </div>
                <Warehouse className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <Progress value={occupationRate} indicatorClassName={occupationColor} />
             <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-lg">{occupationRate.toFixed(1)}%</span>
                <span className="text-muted-foreground">
                    <span className="font-bold text-foreground">{occupiedPositions}</span> de <span className="font-bold text-foreground">{totalPositions}</span> posições ocupadas
                </span>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posições com Produtos Bons</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goodProductsPositions}</div>
            <p className="text-xs text-muted-foreground">Posições que contêm pelo menos um item bom.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posições com Descartes</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discardPositions}</div>
            <p className="text-xs text-muted-foreground">Posições que contêm pelo menos um item para descarte.</p>
          </CardContent>
        </Card>
      </div>

       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Estoque</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                           <Warehouse className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total de Posições</p>
                            <p className="text-xl font-bold">{totalPositions}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <Package className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Posições Ocupadas</p>
                            <p className="text-xl font-bold">{occupiedPositions}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg border p-4">
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                           <PackageCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Posições Disponíveis</p>
                            <p className="text-xl font-bold">{availablePositions}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
