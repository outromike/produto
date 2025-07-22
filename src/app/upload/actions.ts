"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadFiles(formData: FormData): Promise<{ success?: string; error?: string }> {
  const itjFile = formData.get('itjFile') as File | null;
  const jvlFile = formData.get('jvlFile') as File | null;

  if (!itjFile || !jvlFile) {
    return { error: 'Both files are required.' };
  }
  
  if (itjFile.name !== 'Cad_ITJ.csv' || jvlFile.name !== 'Cad_JVL.csv') {
      return { error: 'Incorrect file names. Please upload "Cad_ITJ.csv" and "Cad_JVL.csv".' };
  }

  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    
    // Ensure the data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    const itjBuffer = Buffer.from(await itjFile.arrayBuffer());
    await fs.writeFile(path.join(dataDir, 'Cad_ITJ.csv'), itjBuffer);

    const jvlBuffer = Buffer.from(await jvlFile.arrayBuffer());
    await fs.writeFile(path.join(dataDir, 'Cad_JVL.csv'), jvlBuffer);
    
    // Invalidate the cache for the products page to force a reload of data
    revalidatePath('/products', 'page');

    return { success: 'Files uploaded and product data updated successfully!' };
  } catch (error) {
    console.error('File upload error:', error);
    return { error: 'An unexpected error occurred while saving the files.' };
  }
}
