
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { revalidatePath } from 'next/cache';

async function getSchedules(): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}

async function saveSchedules(schedules: ReturnSchedule[]): Promise<void> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    const data = JSON.stringify(schedules, null, 2);
    await fs.writeFile(filePath, data, 'utf-8');
}

export async function addSchedule(data: Omit<ReturnSchedule, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
  try {
    const schedules = await getSchedules();
    
    const newSchedule: ReturnSchedule = {
      ...data,
      id: new Date().getTime().toString(), // Simple unique ID
      createdAt: new Date().toISOString(),
    };

    schedules.push(newSchedule);
    await saveSchedules(schedules);
    
    // Revalidate the path to trigger data refetch on the client
    revalidatePath('/dashboard/schedules');

    return { success: true };
  } catch (error) {
    console.error("Failed to add schedule:", error);
    return { success: false, error: "Não foi possível salvar o agendamento." };
  }
}
