
"use client";

import { useState } from "react";
import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Truck, Box, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
  

interface CarrierCardProps {
    summary: CarrierScheduleSummary;
}

export function CarrierCard({ summary }: CarrierCardProps) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const router = useRouter();

    const handleStartConference = () => {
        router.push(`/dashboard/receiving/${encodeURIComponent(summary.carrier)}`);
    }

    return (
        <>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Card className="flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 bg-muted/20 pb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg">{summary.carrier}</CardTitle>
                                <CardDescription>{new Date().toLocaleDateString('pt-BR')}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4 pt-4">
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
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Iniciar Conferência?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a iniciar a conferência de recebimento para a transportadora <span className="font-bold">{summary.carrier}</span>. Deseja continuar?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStartConference}>Iniciar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
