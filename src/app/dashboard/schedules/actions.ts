
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
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            await fs.writeFile(SCHEDULES_FILE_PATH, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading agendamentos.json:", error);
        throw new Error("Não foi possível ler os agendamentos.");
    }
}

async function saveSchedules(schedules: ReturnSchedule[]): Promise<void> {
    const data = JSON.stringify(schedules, null, 2);
    await fs.writeFile(SCHEDULES_FILE_PATH, data, 'utf-8');
    // A revalidação foi removida para evitar problemas com a sessão
}

export async function addSchedule(data: Omit<ReturnSchedule, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; createdSchedules?: ReturnSchedule[] }> {
  try {
    const allSchedules = await getSchedules();
    
    const nfds = data.nfd.trim().split(/\s+/).map(nfd => nfd.trim()).filter(Boolean);
    const remessas = data.outgoingShipment?.trim().split(/\s+/).map(r => r.trim()) || [];

    if (nfds.length === 0) {
      return { success: false, error: "Nenhuma NFD válida foi fornecida." };
    }

    const newSchedules: ReturnSchedule[] = nfds.map((nfd, index) => {
        const newSchedule: ReturnSchedule = {
            ...data,
            nfd: nfd,
            outgoingShipment: remessas[index] || '',
            id: `${new Date().getTime()}-${index}`,
            createdAt: new Date().toISOString(),
        };
        return newSchedule;
    });

    const updatedSchedules = [...allSchedules, ...newSchedules];
    await saveSchedules(updatedSchedules);
    return { success: true, createdSchedules: newSchedules };
  } catch (error) {
    console.error("Failed to add schedule(s):", error);
    return { success: false, error: "Não foi possível criar o(s) agendamento(s)." };
  }
}

export async function updateSchedule(id: string, data: Partial<Omit<ReturnSchedule, 'id' | 'createdAt'>>): Promise<{ success: boolean; error?: string, updatedSchedule?: ReturnSchedule }> {
  try {
    const schedules = await getSchedules();
    const scheduleIndex = schedules.findIndex(s => s.id === id);

    if (scheduleIndex === -1) {
      return { success: false, error: "Agendamento não encontrado." };
    }
    
    const updatedSchedule = { ...schedules[scheduleIndex], ...data };
    schedules[scheduleIndex] = updatedSchedule;
    await saveSchedules(schedules);
    return { success: true, updatedSchedule };
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

export async function deleteSchedules(ids: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const schedules = await getSchedules();
      const updatedSchedules = schedules.filter(s => !ids.includes(s.id));
  
      if (schedules.length === updatedSchedules.length) {
          return { success: false, error: "Nenhum agendamento correspondente aos IDs fornecidos foi encontrado para exclusão." };
      }
  
      await saveSchedules(updatedSchedules);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete schedules:", error);
      return { success: false, error: "Não foi possível excluir os agendamentos selecionados." };
    }
  }