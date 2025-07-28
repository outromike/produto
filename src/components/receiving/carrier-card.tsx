
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
import { Truck, Box, FileText, CheckCircle2, Warehouse, Send } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { parseISO, format } from "date-fns";
import { DestinationModal } from "./destination-modal";

interface CarrierCardProps {
    summary: CarrierScheduleSummary;
    onAllocate: (summary: CarrierScheduleSummary) => void;
}

export function CarrierCard({ summary, onAllocate }: CarrierCardProps) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
    const router = useRouter();

    const handleStartConference = () => {
        router.push(`/dashboard/receiving/${encodeURIComponent(summary.carrier)}`);
    }
    
    // Check if any schedule in the summary has a valid BDV
    const hasBdv = summary.schedules.some(s => s.bdv && s.bdv !== 'SEM BDV');
    const schedulesWithBdv = summary.schedules.filter(s => s.bdv && s.bdv !== 'SEM BDV');

    const cardClasses = cn(
        "flex h-full flex-col overflow-hidden transition-all duration-300",
        !summary.isConferenceCompleted && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
        summary.isConferenceCompleted && !summary.isAllocationCompleted && "border-green-500/50 bg-green-500/10",
        summary.isAllocationCompleted && "border-blue-500/50 bg-blue-500/10 opacity-70"
    );

    const iconContainerClasses = cn(
        "flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
        summary.isConferenceCompleted && !summary.isAllocationCompleted && "bg-green-500/20 text-green-600",
        summary.isAllocationCompleted && "bg-blue-500/20 text-blue-600"
    );

    return (
        <>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild disabled={summary.isConferenceCompleted}>
                     <Card className={cardClasses}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                            <div className={iconContainerClasses}>
                                {summary.isConferenceCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Truck className="h-6 w-6" />}
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg">{summary.carrier}</CardTitle>
                                <CardDescription>{format(parseISO(summary.date), 'dd/MM/yyyy')}</CardDescription>
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
                        {summary.isConferenceCompleted && !summary.isAllocationCompleted && (
                             <CardFooter className="flex-col items-stretch gap-2 p-4">
                                <div className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-green-600">
                                   <CheckCircle2 className="h-4 w-4" /> Conferência Finalizada
                                </div>
                                <div className="flex flex-col gap-2">
                                     <Button 
                                        size="sm" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent dialog from opening
                                            onAllocate(summary);
                                        }}
                                    >
                                        <Warehouse className="mr-2 h-4 w-4" />
                                        Alocar na Rua 08
                                    </Button>
                                    {hasBdv && (
                                        <Button 
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDestinationModalOpen(true);
                                            }}
                                        >
                                           <Send className="mr-2 h-4 w-4" />
                                           Destinar Produtos
                                        </Button>
                                    )}
                                </div>
                            </CardFooter>
                        )}
                        {summary.isAllocationCompleted && (
                             <CardFooter className="py-2">
                                <div className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-blue-600">
                                   <Warehouse className="h-4 w-4" /> Alocação Finalizada
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>
                        Iniciar Conferência?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        { `Você está prestes a iniciar a conferência de recebimento para a transportadora ${summary.carrier}. Deseja continuar?` }
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleStartConference} 
                    >
                         Iniciar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {hasBdv && (
                 <DestinationModal 
                    isOpen={isDestinationModalOpen}
                    onClose={() => setIsDestinationModalOpen(false)}
                    schedules={schedulesWithBdv}
                    carrierName={summary.carrier}
                 />
            )}
        </>
    )
}
