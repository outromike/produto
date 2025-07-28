
"use client";

import { useState } from 'react';
import { ReturnSchedule, ConferenceEntry, StorageEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ReportsClientProps {
  schedules: ReturnSchedule[];
  conferences: ConferenceEntry[];
  storageData: StorageEntry[];
}

export function ReportsClient({ schedules, conferences, storageData }: ReportsClientProps) {
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const handleExportSchedules = () => {
        if (!dateRange || !dateRange.from || !dateRange.to) {
            toast({
                title: 'Período inválido',
                description: 'Por favor, selecione uma data de início e fim.',
                variant: 'destructive',
            });
            return;
        }

        const filteredSchedules = schedules.filter(s => {
            const scheduleDate = parseISO(s.date);
            return scheduleDate >= dateRange.from! && scheduleDate <= dateRange.to!;
        }).map(s => ({
            'Data': format(parseISO(s.date), 'dd/MM/yyyy'),
            'Transportadora': s.carrier,
            'NFD': s.nfd,
            'Cliente': s.customer,
            'Motivo Devolução': s.returnReason,
            'Estado do Produto': s.productState,
            'Volume NF': s.invoiceVolume,
            'Nota de Venda': s.salesNote,
            'Remessa de Saída': s.outgoingShipment,
            'BDV': s.bdv,
            'OV': s.ov,
            'Destino': s.destination || 'N/A',
            'Data de Criação': format(parseISO(s.createdAt), 'dd/MM/yyyy HH:mm'),
        }));
        
        if (filteredSchedules.length === 0) {
            toast({
                title: 'Nenhum dado encontrado',
                description: 'Não há agendamentos para o período selecionado.',
            });
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(filteredSchedules);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendamentos');
        XLSX.writeFile(workbook, 'Relatorio_Agendamentos.xlsx');
    };

    const handleExportStorage = () => {
        const mappedData = storageData.map(d => ({
            'Prédio': d.building,
            'Nível': d.level,
            'Produto (SKU)': d.productSku,
            'Descrição do Produto': d.productDescription,
            'Quantidade': d.quantity,
            'Status': d.status,
            'NFD': d.nfd,
            'Nota de Venda': d.salesNote,
            'Remessa': d.shipment,
            'Data de Alocação': format(parseISO(d.allocatedAt), 'dd/MM/yyyy HH:mm'),
        }));

        if (mappedData.length === 0) {
            toast({ title: 'Nenhum dado encontrado', description: 'O estoque da Rua 08 está vazio.' });
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Estoque_Rua_08');
        XLSX.writeFile(workbook, 'Relatorio_Estoque_Rua08.xlsx');
    };

    const handleExportReceiving = () => {
        const mappedData = conferences.map(c => ({
            'NFD': c.nfd,
            'Produto (SKU)': c.productSku,
            'Descrição do Produto': c.productDescription,
            'Volume Recebido': c.receivedVolume,
            'Volume Alocado': c.allocatedVolume || 0,
            'Estado do Produto': c.productState,
            'Observações': c.observations,
            'Data da Conferência': format(parseISO(c.conferenceTimestamp), 'dd/MM/yyyy HH:mm'),
        }));
        
        if (mappedData.length === 0) {
            toast({ title: 'Nenhum dado encontrado', description: 'Não há conferências de recebimento registradas.' });
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recebimentos');
        XLSX.writeFile(workbook, 'Relatorio_Recebimentos.xlsx');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold">Relatórios</h1>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Relatório de Agendamentos</CardTitle>
                        <CardDescription>Exporte os agendamentos de devolução por um período específico.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DateRangePicker date={dateRange} setDate={setDateRange} />
                        <Button onClick={handleExportSchedules} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar por Período
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Relatório de Estoque - Rua 08</CardTitle>
                        <CardDescription>Exporte a lista completa de todos os itens alocados no estoque.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExportStorage} className="w-full">
                             <Download className="mr-2 h-4 w-4" />
                            Exportar Estoque Completo
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Relatório de Recebimento</CardTitle>
                        <CardDescription>Exporte o histórico completo de todas as conferências de NFs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExportReceiving} className="w-full">
                             <Download className="mr-2 h-4 w-4" />
                            Exportar Recebimentos
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
