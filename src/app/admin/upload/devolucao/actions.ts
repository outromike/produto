
"use server";

import { redirect } from 'next/navigation';

export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('fileAgendamento') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento deve ser enviado.' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Simplesmente loga o sucesso do recebimento do arquivo por enquanto.
        console.log(`Arquivo ${file.name} recebido com sucesso com ${buffer.length} bytes.`);
        
    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar o arquivo: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar o arquivo.' };
    }
    
    // Redireciona em caso de sucesso
    redirect('/admin');
}
