"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadFiles(formData: FormData): Promise<{ success?: string; error?: string }> {
  const itjFile = formData.get('itjFile') as File | null;
  const jvlFile = formData.get('jvlFile') as File | null;

  if (!itjFile?.size && !jvlFile?.size) {
    return { error: 'Please upload at least one file.' };
  }

  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    let successMessages: string[] = [];

    if (itjFile?.size) {
      const itjBuffer = Buffer.from(await itjFile.arrayBuffer());
      await fs.writeFile(path.join(dataDir, 'Cad_ITJ.csv'), itjBuffer);
      successMessages.push('Itajaí (ITJ) data updated.');
    }

    if (jvlFile?.size) {
      const jvlBuffer = Buffer.from(await jvlFile.arrayBuffer());
      await fs.writeFile(path.join(dataDir, 'Cad_JVL.csv'), jvlBuffer);
      successMessages.push('Joinville (JVL) data updated.');
    }
    
    // Invalidate the cache for the products page to force a reload of data
    revalidatePath('/products', 'page');

    return { success: successMessages.join(' ') };
  } catch (error) {
    console.error('File upload error:', error);
    return { error: 'An unexpected error occurred while saving the files.' };
  }
}
