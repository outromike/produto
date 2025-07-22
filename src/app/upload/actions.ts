// src/app/upload/actions.ts
'use server';

import { writeFile, promises as fs } from 'fs';
import { resolve } from 'path';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

function parseCSV(csvContent: string, unit: 'ITJ' | 'JVL'): Product[] {
  const products: Product[] = [];
  const lines = csvContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    console.error("CSV parsing failed: No data rows found.");
    return [];
  }

  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase());

  const getIndex = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const index = headers.indexOf(name.toLowerCase());
      if (index !== -1) return index;
    }
    return -1;
  };
  
  const headerMapping = {
    sku: getIndex(['sku']),
    item: getIndex(['item']),
    description: getIndex(['descrição', 'descricao']),
    category: getIndex(['des categoria']),
    netWeight: getIndex(['peso liquido']),
    grossWeight: getIndex(['peso bruto sku']),
    volume: getIndex(['volume m3']),
    height: getIndex(['altura']),
    width: getIndex(['largura']),
    length: getIndex(['comprimento']),
    palletHeight: getIndex(['qtd. cx altura']),
    palletBase: getIndex(['qtd. cx lastro']),
    barcode: getIndex(['cod. barras']),
    packaging: getIndex(['caixa']),
    measurementUnit: getIndex(['unid med']),
    quantity: getIndex(['qtd. itens']),
    classification: getIndex(['clasificação abc', 'classificacao abc']),
  };

  if (headerMapping.sku === -1 || headerMapping.description === -1) {
    console.error("CSV parsing failed: Missing required headers (SKU or Descrição). Found headers:", headers);
    return [];
  }

  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(delimiter);
    if (data.length !== headers.length) continue;

    const getString = (index: number) => (data[index] || '').trim();
    const getNumber = (index: number) => parseFloat((data[index] || '0').replace(',', '.')) || 0;

    const height = getNumber(headerMapping.height);
    const width = getNumber(headerMapping.width);
    const length = getNumber(headerMapping.length);
    
    const product: Product = {
      sku: getString(headerMapping.sku),
      item: getString(headerMapping.item),
      description: getString(headerMapping.description),
      category: getString(headerMapping.category),
      netWeight: getNumber(headerMapping.netWeight),
      grossWeight: getNumber(headerMapping.grossWeight),
      volume: getNumber(headerMapping.volume),
      dimensions: `${height}x${width}x${length}`,
      palletization: {
        height: getNumber(headerMapping.palletHeight),
        base: getNumber(headerMapping.palletBase),
      },
      barcode: getString(headerMapping.barcode),
      packaging: getString(headerMapping.packaging),
      measurementUnit: getString(headerMapping.measurementUnit),
      quantity: getNumber(headerMapping.quantity),
      classification: getString(headerMapping.classification),
      unit: unit,
    };
    
    if (product.sku && product.description) {
        products.push(product);
    }
  }

  return products;
}


export async function uploadProducts(formData: FormData): Promise<{ success: boolean; message: string }> {
  const itjFile = formData.get('itjFile') as File | null;
  const jvlFile = formData.get('jvlFile') as File | null;

  if (!itjFile?.size && !jvlFile?.size) {
    return { success: false, message: 'Nenhum arquivo foi enviado.' };
  }

  let allProducts: Product[] = [];

  try {
    if (itjFile?.size) {
      const itjContent = await itjFile.text();
      const itjProducts = parseCSV(itjContent, 'ITJ');
      allProducts.push(...itjProducts);
    }

    if (jvlFile?.size) {
      const jvlContent = await jvlFile.text();
      const jvlProducts = parseCSV(jvlContent, 'JVL');
      allProducts.push(...jvlProducts);
    }
    
    if (allProducts.length === 0) {
        return { success: false, message: 'Não foi possível extrair nenhum produto dos arquivos. Verifique o formato e os cabeçalhos do CSV.' };
    }
    
    // Path to your products.json file
    const dbPath = resolve(process.cwd(), 'src/data/products.json');

    await new Promise((resolve, reject) => {
      writeFile(dbPath, JSON.stringify(allProducts, null, 2), 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });

    revalidatePath('/products');

    return { success: true, message: `${allProducts.length} produtos foram atualizados com sucesso.` };
  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return { success: false, message: `Falha no upload: ${errorMessage}` };
  }
}
