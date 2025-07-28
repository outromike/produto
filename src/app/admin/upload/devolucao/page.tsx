// src/app/admin/upload/devolucao/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DevolucaoUploadForm } from "@/components/upload/devolucao-upload-form";
import { redirect } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';


export default function UploadDevolucaoPage() {
    async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
        'use server';
        
        const findHeaderIndex = (headerRow: string[], possibleNames: string[]): number => {
            for (const name of possibleNames) {
                const index = headerRow.findIndex(header => header.trim().toLowerCase() === name.toLowerCase());
                if (index !== -1) return index;
            }
            return -1;
        };

        const parseReturnCSV = (csvContent: string): ReturnSchedule[] => {
            const lines = csvContent.trim().split(/\r\n|\n/);
            if (lines.length < 2) return [];

            const delimiter = lines[0].includes(';') ? ';' : ',';
            
            const headerRow = lines[0].split(delimiter).map(h => h.replace(/"/g, ''));
            const dataRows = lines.slice(1);

            const headerMapping = {
                date: findHeaderIndex(headerRow, ['data']),
                carrier: findHeaderIndex(headerRow, ['transportadora']),
                outboundShipment: findHeaderIndex(headerRow, ['remessa de saida']),
                salesNote: findHeaderIndex(headerRow, ['nota venda']),
                nfd: findHeaderIndex(headerRow, ['nfd']),
                client: findHeaderIndex(headerRow, ['cliente']),
                bdv: findHeaderIndex(headerRow, ['bdv']),
                ov: findHeaderIndex(headerRow, ['ov']),
                returnReason: findHeaderIndex(headerRow, ['motivo da devolução']),
                productState: findHeaderIndex(headerRow, ['estado do produto']),
                nfVolume: findHeaderIndex(headerRow, ['vol.nf']),
                status: findHeaderIndex(headerRow, ['status']),
                storageDest: findHeaderIndex(headerRow, ['dest. armazenagem']),
                received: findHeaderIndex(headerRow, ['recebido']),
                receivedState: findHeaderIndex(headerRow, ['estado do recebido']),
                receiptNotes: findHeaderIndex(headerRow, ['observações de recebimento']),
            };

            return dataRows.map(line => {
                const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
                
                const schedule: ReturnSchedule = {
                    date: values[headerMapping.date] || '',
                    carrier: values[headerMapping.carrier] || '',
                    outboundShipment: values[headerMapping.outboundShipment] || '',
                    salesNote: values[headerMapping.salesNote] || '',
                    nfd: values[headerMapping.nfd] || '',
                    client: values[headerMapping.client] || '',
                    bdv: values[headerMapping.bdv] || '',
                    ov: values[headerMapping.ov] || '',
                    returnReason: values[headerMapping.returnReason] || '',
                    productState: values[headerMapping.productState] || '',
                    nfVolume: values[headerMapping.nfVolume] || '',
                    status: values[headerMapping.status] || '',
                    storageDest: values[headerMapping.storageDest] || '',
                    received: values[headerMapping.received] || '',
                    receivedState: values[headerMapping.receivedState] || '',
                    receiptNotes: values[headerMapping.receiptNotes] || '',
                };
                return schedule;
            }).filter(s => s.date && s.client);
        };
        
        const file = formData.get('file') as File | null;

        if (!file || file.size === 0) {
            return { error: 'O arquivo de agendamento de devolução deve ser enviado.' };
        }

        try {
            const filePath = path.join(process.cwd(), 'src', 'data', 'devolucoes.json');
            
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            let allSchedules: ReturnSchedule[] = [];
            try {
                const currentData = await fs.readFile(filePath, 'utf-8');
                allSchedules = JSON.parse(currentData);
            } catch (e) {
                // File doesn't exist, which is fine. It will be created.
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const content = buffer.toString('utf-8');
            const newSchedules = parseReturnCSV(content);

            const updatedSchedules = allSchedules.concat(newSchedules);

            await fs.writeFile(filePath, JSON.stringify(updatedSchedules, null, 2), 'utf-8');

        } catch (error) {
            console.error('File processing error:', error);
            if (error instanceof Error) {
                return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
            }
            return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
        }
        
        redirect('/admin');
    }


  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 md:px-6">
       <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel do Admin
          </Link>
        </Button>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Upload de Agendamento de Devolução</CardTitle>
          <CardDescription>
            Faça o upload do arquivo CSV para criar ou atualizar os agendamentos de devolução.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Certifique-se de que o arquivo está no formato CSV.</li>
                        <li>O sistema identificará as colunas automaticamente com base nos cabeçalhos.</li>
                        <li>O sistema irá adicionar os novos agendamentos ao arquivo existente.</li>
                    </ul>
                </AlertDescription>
            </Alert>
          <DevolucaoUploadForm uploadAction={uploadReturnSchedules} />
        </CardContent>
      </Card>
    </main>
  );
}
