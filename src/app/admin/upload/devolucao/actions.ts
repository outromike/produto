"use server";

import { redirect } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';

// Função para encontrar o índice do cabeçalho com múltiplos nomes possíveis
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
    }).filter(s => s.date && s.client); // Filtra linhas vazias
};


export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
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
