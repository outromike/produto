
"use client";

import { useState, useEffect, useTransition } from "react";
import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { ConferenceEntry, Product, AllocationEntry } from "@/types";
import { getConferenceByNfd } from "@/app/dashboard/receiving/actions";
import { allocateProducts } from "@/app/dashboard/rua08/actions";

import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "../ui/scroll-area";

const buildings = [ "111", "109", "107", "105", "103", "101", "99", "97", "95", "93", "91", "89", "87", "85", "83", "81", "79", "77", "75", "73" ];
const levels = [ "1A", "1B", "2", "3", "4", "5" ];
const statuses = [ "Produto Bom OK", "Produto Bom SEM BDV", "Produto Bom Ag. Fiscal", "Descarte OK", "Descarte SEM BDV", "Descarte Ag. Fiscal", "Correios", "Vazio", "Outro" ];


interface AllocationWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinish: () => void;
    summary: CarrierScheduleSummary;
    allProducts: Product[];
    storageData: any[]; // Not used directly, but can be for future validation
}

interface AllocationItem extends ConferenceEntry {
    quantityToAllocate: number;
    building: string;
    level: string;
    status: string;
}

export function AllocationWizardModal({ isOpen, onClose, onFinish, summary }: AllocationWizardModalProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    const [selectedNfd, setSelectedNfd] = useState<string>("");
    const [conferenceItems, setConferenceItems] = useState<AllocationItem[]>([]);
    
    useEffect(() => {
        if (selectedNfd) {
            startTransition(async () => {
                const items = await getConferenceByNfd(selectedNfd);
                const allocationItems: AllocationItem[] = items.map(item => ({
                    ...item,
                    quantityToAllocate: Math.max(0, item.receivedVolume - (item.allocatedVolume || 0)),
                    building: '',
                    level: '',
                    status: '',
                }));
                setConferenceItems(allocationItems);
            });
        } else {
            setConferenceItems([]);
        }
    }, [selectedNfd]);
    
    const handleNextStep = () => {
        if (selectedNfd) {
            setStep(2);
        } else {
            toast({ title: "Atenção", description: "Por favor, selecione uma Nota Fiscal.", variant: "destructive" });
        }
    }

    const handleAllocationChange = (id: string, field: keyof AllocationItem, value: string | number) => {
        setConferenceItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    // Validation for quantity
                    if (field === 'quantityToAllocate') {
                        const available = item.receivedVolume - (item.allocatedVolume || 0);
                        const numericValue = Number(value);
                        if (numericValue > available) {
                            toast({ title: "Quantidade inválida", description: `Máximo para alocar é ${available}.`, variant: "destructive" });
                            return { ...item, [field]: available };
                        }
                         if (numericValue < 0) {
                            return { ...item, [field]: 0 };
                        }
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };
    
    const handleSubmitAllocations = () => {
        const allocationsToSave: AllocationEntry[] = [];
        for (const item of conferenceItems) {
            if (item.quantityToAllocate > 0) {
                if (!item.building || !item.level || !item.status) {
                    toast({ title: "Campos incompletos", description: `Por favor, preencha todos os campos para o produto ${item.productDescription}.`, variant: "destructive" });
                    return;
                }
                const schedule = summary.schedules.find(s => s.nfd === item.nfd);
                allocationsToSave.push({
                    conferenceId: item.id,
                    building: item.building,
                    level: item.level,
                    status: item.status,
                    quantity: item.quantityToAllocate,
                    nfd: item.nfd,
                    productSku: item.productSku,
                    productDescription: item.productDescription,
                    salesNote: schedule?.salesNote || "",
                    shipment: schedule?.outgoingShipment || "",
                });
            }
        }

        if (allocationsToSave.length === 0) {
            toast({ title: "Nenhuma alocação", description: "Nenhuma quantidade foi definida para alocação.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const result = await allocateProducts(allocationsToSave);
            if (result.success) {
                toast({ title: "Sucesso!", description: "Produtos alocados com sucesso." });
                onFinish();
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" });
            }
        });
    };

    const nfdList = Array.from(new Set(summary.schedules.map(s => s.nfd)));
    
    return(
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-full w-full max-w-full overflow-y-auto p-0 sm:h-auto sm:max-w-4xl sm:p-6">
                <DialogHeader className="p-6 sm:p-0">
                    <DialogTitle>Assistente de Alocação - Rua 08</DialogTitle>
                    <DialogDescription>
                      {step === 1 
                        ? `Selecione a NFD da transportadora ${summary.carrier} para iniciar a alocação.`
                        : `Para a NFD ${selectedNfd}, defina a quantidade, localização e status de cada produto a ser alocado.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-0 sm:p-4">
                    {step === 1 && (
                         <div className="space-y-4">
                            <Select onValueChange={setSelectedNfd} value={selectedNfd}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma NFD..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {nfdList.map(nfd => (
                                        <SelectItem key={nfd} value={nfd}>{nfd}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {step === 2 && (
                         <ScrollArea className="h-[50vh] rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Recebido</TableHead>
                                        <TableHead>Alocado</TableHead>
                                        <TableHead>Saldo</TableHead>
                                        <TableHead className="w-[100px]">Qtd. Alocar</TableHead>
                                        <TableHead className="w-[120px]">Prédio</TableHead>
                                        <TableHead className="w-[100px]">Nível</TableHead>
                                        <TableHead className="w-[200px]">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isPending ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : conferenceItems.map(item => {
                                        const saldo = Math.max(0, item.receivedVolume - (item.allocatedVolume || 0));
                                        return (
                                            <TableRow key={item.id} className={saldo <= 0 ? "opacity-50" : ""}>
                                                <TableCell className="text-xs">
                                                    <p className="font-medium">{item.productDescription}</p>
                                                    <p className="text-muted-foreground">SKU: {item.productSku}</p>
                                                </TableCell>
                                                <TableCell>{item.receivedVolume}</TableCell>
                                                <TableCell>{item.allocatedVolume || 0}</TableCell>
                                                <TableCell className="font-bold">{saldo}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        value={item.quantityToAllocate}
                                                        onChange={(e) => handleAllocationChange(item.id, 'quantityToAllocate', e.target.value)}
                                                        max={saldo}
                                                        disabled={saldo <= 0}
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select onValueChange={(v) => handleAllocationChange(item.id, 'building', v)} value={item.building} disabled={saldo <= 0}>
                                                        <SelectTrigger className="h-8"><SelectValue placeholder="Prédio"/></SelectTrigger>
                                                        <SelectContent>{buildings.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Select onValueChange={(v) => handleAllocationChange(item.id, 'level', v)} value={item.level} disabled={saldo <= 0}>
                                                        <SelectTrigger className="h-8"><SelectValue placeholder="Nível"/></SelectTrigger>
                                                        <SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                     <Select onValueChange={(v) => handleAllocationChange(item.id, 'status', v)} value={item.status} disabled={saldo <= 0}>
                                                        <SelectTrigger className="h-8"><SelectValue placeholder="Status"/></SelectTrigger>
                                                        <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                         </ScrollArea>
                    )}
                </div>

                <DialogFooter className="sticky bottom-0 left-0 right-0 flex-col-reverse gap-2 border-t bg-background p-4 sm:flex-row sm:justify-end sm:p-6">
                    {step === 1 && (
                        <>
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleNextStep} disabled={!selectedNfd || isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Continuar
                            </Button>
                        </>
                    )}
                     {step === 2 && (
                        <>
                            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                            <Button onClick={handleSubmitAllocations} disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Salvar Alocações
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
