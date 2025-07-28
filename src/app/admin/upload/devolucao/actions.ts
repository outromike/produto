
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { redirect } from 'next/navigation';

// Helper to find header index with multiple possible names, case-insensitive
const findHeaderIndex = (headerRow: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
        const index = headerRow.findIndex(header => header?.trim().toLowerCase() === name.toLowerCase());
        if (index !== -1) return index;
    }
    return -1;
};

const parseCSV = (csvContent: string): ReturnSchedule[] => {
    const lines = csvContent.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    const headerRow = lines[0].split(delimiter).map(h => h.replace(/"/g, ''));
    const dataRows = lines.slice(1);

    const h = {
        date: findHeaderIndex(headerRow, ['DATA']),
        carrier: findHeaderIndex(headerRow, ['TRANSPORTADORA']),
        outboundShipment: findHeaderIndex(headerRow, ['REMESSA DE SAIDA']),
        salesNote: findHeaderIndex(headerRow, ['NOTA VENDA']),
        nfd: findHeaderIndex(headerRow, ['NFD']),
        client: findHeaderIndex(headerRow, ['CLIENTE']),
        bdv: findHeaderIndex(headerRow, ['BDV']),
        ov: findHeaderIndex(headerRow, ['OV']),
        returnReason: findHeaderIndex(headerRow, ['MOTIVO DA DEVOLUÇÃO']),
        productState: findHeaderIndex(headerRow, ['ESTADO DO PRODUTO']),
        nfVolume: findHeaderIndex(headerRow, ['VOL.NF']),
        status: findHeaderIndex(headerRow, ['STATUS']),
        storageDest: findHeaderIndex(headerRow, ['DEST. ARMAZENAGEM']),
        received: findHeaderIndex(headerRow, ['RECEBIDO']),
        receivedState: findHeaderIndex(headerRow, ['ESTADO DO RECEBIDO']),
        receiptNotes: findHeaderIndex(headerRow, ['OBSERVAÇÕES DE RECEBIMENTO']),
    };

    return dataRows.map(line => {
        const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
        
        const schedule: ReturnSchedule = {
            date: h.date !== -1 ? values[h.date] || '' : '',
            carrier: h.carrier !== -1 ? values[h.carrier] || '' : '',
            outboundShipment: h.outboundShipment !== -1 ? values[h.outboundShipment] || '' : '',
            salesNote: h.salesNote !== -1 ? values[h.salesNote] || '' : '',
            nfd: h.nfd !== -1 ? values[h.nfd] || '' : '',
            client: h.client !== -1 ? values[h.client] || '' : '',
            bdv: h.bdv !== -1 ? values[h.bdv] || '' : '',
            ov: h.ov !== -1 ? values[h.ov] || '' : '',
            returnReason: h.returnReason !== -1 ? values[h.returnReason] || '' : '',
            productState: h.productState !== -1 ? values[h.productState] || '' : '',
            nfVolume: h.nfVolume !== -1 ? values[h.nfVolume] || '' : '',
            status: h.status !== -1 ? values[h.status] || '' : '',
            storageDest: h.storageDest !== -1 ? values[h.storageDest] || '' : '',
            received: h.received !== -1 ? values[h.received] || '' : '',
            receivedState: h.receivedState !== -1 ? values[h.receivedState] || '' : '',
            receiptNotes: h.receiptNotes !== -1 ? values[h.receiptNotes] || '' : '',
        };
        return schedule;
    }).filter(s => s.date || s.carrier || s.client); // Filter out any empty rows
};

export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento de devolução deve ser enviado.' };
    }

    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'devolucoes.json');
        
        let existingSchedules: ReturnSchedule[] = [];
        try {
            const currentData = await fs.readFile(filePath, 'utf-8');
            if (currentData) {
                existingSchedules = JSON.parse(currentData);
            }
        } catch (error) {
            // If the file does not exist, we continue with an empty array, which is expected on the first run.
            console.log("devolucoes.json not found, creating a new one.");
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString('utf-8');
        const newSchedules = parseCSV(content);

        // Concatenate existing schedules with new ones
        const allSchedules = existingSchedules.concat(newSchedules);

        await fs.writeFile(filePath, JSON.stringify(allSchedules, null, 2), 'utf-8');

    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    redirect('/admin');
}
