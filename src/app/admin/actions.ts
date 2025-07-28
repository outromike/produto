"use server";

import { redirect } from 'next/navigation';

// Ação simplificada para aceitar o upload, sem processamento.
export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('fileAgendamento') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento deve ser enviado.' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Apenas para confirmar que o arquivo foi recebido.
        console.log(`Arquivo ${file.name} recebido com ${buffer.length} bytes. Sem processamento adicional.`);
        
    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    // Retorna um objeto vazio em caso de sucesso, o cliente irá tratar a UI.
    return {}; 
}
