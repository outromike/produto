
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { redirect } from 'next/navigation';

const findHeaderIndex = (headerRow: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
        const index = headerRow.findIndex(header => header.trim().toLowerCase() === name.toLowerCase());
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

    const headerMapping = {
        data: findHeaderIndex(headerRow, ['DATA']),
        transportadora: findHeaderIndex(headerRow, ['TRANSPORTADORA']),
        remessaSaida: findHeaderIndex(headerRow, ['REMESSA DE SAIDA']),
        notaVenda: findHeaderIndex(headerRow, ['NOTA VENDA']),
        nfd: findHeaderIndex(headerRow, ['NFD']),
        cliente: findHeaderIndex(headerRow, ['CLIENTE']),
        bdv: findHeaderIndex(headerRow, ['BDV']),
        ov: findHeaderIndex(headerRow, ['OV']),
        motivoDevolucao: findHeaderIndex(headerRow, ['MOTIVO DA DEVOLUÇÃO']),
        estadoProduto: findHeaderIndex(headerRow, ['ESTADO DO PRODUTO']),
        volNf: findHeaderIndex(headerRow, ['VOL.NF']),
        status: findHeaderIndex(headerRow, ['STATUS']),
        destArmazenagem: findHeaderIndex(headerRow, ['DEST. ARMAZENAGEM']),
        recebido: findHeaderIndex(headerRow, ['RECEBIDO']),
        estadoRecebido: findHeaderIndex(headerRow, ['ESTADO DO RECEBIDO']),
        observacoesRecebimento: findHeaderIndex(headerRow, ['OBSERVAÇÕES DE RECEBIMENTO']),
    };

    return dataRows.map(line => {
        const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
        
        const schedule: ReturnSchedule = {
            data: values[headerMapping.data] || '',
            transportadora: values[headerMapping.transportadora] || '',
            remessaSaida: values[headerMapping.remessaSaida] || '',
            notaVenda: values[headerMapping.notaVenda] || '',
            nfd: values[headerMapping.nfd] || '',
            cliente: values[headerMapping.cliente] || '',
            bdv: values[headerMapping.bdv] || '',
            ov: values[headerMapping.ov] || '',
            motivoDevolucao: values[headerMapping.motivoDevolucao] || '',
            estadoProduto: values[headerMapping.estadoProduto] || '',
            volNf: values[headerMapping.volNf] || '',
            status: values[headerMapping.status] || '',
            destArmazenagem: values[headerMapping.destArmazenagem] || '',
            recebido: values[headerMapping.recebido] || '',
            estadoRecebido: values[headerMapping.estadoRecebido] || '',
            observacoesRecebimento: values[headerMapping.observacoesRecebimento] || '',
        };
        return schedule;
    }).filter(s => s.data && s.transportadora); // Filter out any empty/invalid rows
};

export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('fileAgendamento') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento deve ser enviado.' };
    }

    let schedules: ReturnSchedule[] = [];

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString('utf-8');
        schedules = parseCSV(content);

        const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
        await fs.writeFile(filePath, JSON.stringify(schedules, null, 2), 'utf-8');

    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    redirect('/admin');
}
