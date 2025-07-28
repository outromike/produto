
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { revalidatePath } from 'next/cache';

const SCHEDULES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');

async function getSchedules(): Promise<ReturnSchedule[]> {
    try {
        const jsonData = await fs.readFile(SCHEDULES_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData) as ReturnSchedule[];
    } catch (error) {
        // Se o arquivo não existir (ENOENT), retorne um array vazio.
        // Isso é esperado na primeira execução ou se o arquivo for deletado.
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading agendamentos.json:", error);
        throw new Error("Não foi possível ler os agendamentos.");
    }
}

async function saveSchedules(schedules: ReturnSchedule[]): Promise<void> {
    const data = JSON.stringify(schedules, null, 2);
    await fs.writeFile(SCHEDULES_FILE_PATH, data, 'utf-8');
    // Revalida o cache da página de agendamentos para que a próxima visita
    // já tenha os dados atualizados no servidor.
    revalidatePath('/dashboard/schedules'); 
}

export async function addSchedule(data: Omit<ReturnSchedule, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
  try {
    const schedules = await getSchedules();
    const newSchedule: ReturnSchedule = {
      ...data,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };
    schedules.push(newSchedule);
    await saveSchedules(schedules);
    return { success: true };
  } catch (error) {
    console.error("Failed to add schedule:", error);
    return { success: false, error: "Não foi possível criar o agendamento." };
  }
}

export async function updateSchedule(id: string, data: Partial<Omit<ReturnSchedule, 'id' | 'createdAt'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const schedules = await getSchedules();
    const scheduleIndex = schedules.findIndex(s => s.id === id);

    if (scheduleIndex === -1) {
      return { success: false, error: "Agendamento não encontrado." };
    }

    schedules[scheduleIndex] = { ...schedules[scheduleIndex], ...data };
    await saveSchedules(schedules);
    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, error: "Não foi possível atualizar o agendamento." };
  }
}

export async function deleteSchedule(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const schedules = await getSchedules();
    const updatedSchedules = schedules.filter(s => s.id !== id);

    if (schedules.length === updatedSchedules.length) {
        return { success: false, error: "Agendamento não encontrado para exclusão." };
    }

    await saveSchedules(updatedSchedules);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false, error: "Não foi possível excluir o agendamento." };
  }
}
