"use server";

import { redirect } from 'next/navigation';

export async function uploadReturnSchedules(formData: FormData): Promise<{ error?: string }> {
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
        return { error: 'O arquivo de agendamento de devolução deve ser enviado.' };
    }

    // Por enquanto, apenas redirecionamos para provar que o upload funciona.
    // A lógica de processamento do CSV será adicionada depois.
    
    redirect('/admin');
}
