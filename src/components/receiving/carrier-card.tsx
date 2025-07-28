
"use client";

import { useState } from "react";
import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Truck, Box, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
  

interface CarrierCardProps {
    summary: CarrierScheduleSummary;
}

export function CarrierCard({ summary }: CarrierCardProps) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const router = useRouter();

    const handleStartConference = () => {
        router.push(`/dashboard/receiving/${encodeURIComponent(summary.carrier)}`);
    }

    const cardClasses = cn(
        "flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        summary.isCompleted && "border-green-500/50 bg-green-500/10 hover:shadow-green-500/20"
    );

    const iconContainerClasses = cn(
        "flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
        summary.isCompleted && "bg-green-500/20 text-green-600"
    );

    return (
        <>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Card className={cardClasses}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                            <div className={iconContainerClasses}>
                                {summary.isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg">{summary.carrier}</CardTitle>
                                <CardDescription>{new Date().toLocaleDateString('pt-BR')}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Total de Notas</span>
                                </div>
                                <span className="font-bold">{summary.totalNotes}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Box className="h-4 w-4" />
                                    <span>Total de Volumes</span>
                                </div>
                                <span className="font-bold">{summary.totalVolume}</span>
                            </div>
                        </CardContent>
                        {summary.isCompleted && (
                             <CardFooter className="py-2">
                                <div className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-green-600">
                                   <CheckCircle2 className="h-4 w-4" /> Conferência Finalizada
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>
                        {summary.isCompleted ? "Revisar Conferência?" : "Iniciar Conferência?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {summary.isCompleted 
                            ? "Esta conferência já foi finalizada. Deseja revisar as notas?"
                            : `Você está prestes a iniciar a conferência de recebimento para a transportadora ${summary.carrier}. Deseja continuar?`
                        }
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleStartConference} 
                        className={cn(summary.isCompleted && "bg-primary hover:bg-primary/90")}
                    >
                         {summary.isCompleted ? "Revisar" : "Iniciar"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
