"use server";

import { redirect } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';

// Ação simplificada para aceitar o upload de agendamentos, sem processamento.
export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('fileAgendamento') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento deve ser enviado.' };
    }

    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
        
        // Apenas para confirmar que o arquivo foi recebido, sem processamento.
        console.log(`Arquivo ${file.name} recebido. Nenhuma validação ou processamento será feito por enquanto.`);

        // Escreve um array vazio para criar/limpar o arquivo, mas não processa o conteúdo do CSV.
        await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
        
    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    redirect('/admin');
}
