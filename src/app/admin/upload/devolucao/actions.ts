
"use server";

import { redirect } from 'next/navigation';

export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('fileAgendamento') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento deve ser enviado.' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log(`Arquivo ${file.name} recebido com sucesso com ${buffer.length} bytes.`);
        
    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    redirect('/admin');
}
