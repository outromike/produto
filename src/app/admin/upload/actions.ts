
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

// Helper to find header index with multiple possible names
const findHeaderIndex = (headerRow: string[], possibleNames: string[]): number => {
    for (const name of possibleNames) {
        const index = headerRow.findIndex(header => header.trim().toLowerCase() === name.toLowerCase());
        if (index !== -1) return index;
    }
    return -1;
};

const parseCSV = (csvContent: string, unit: 'ITJ' | 'JVL'): Product[] => {
    const lines = csvContent.trim().split(/\r\n|\n/);
    if (lines.length < 2) return [];

    // Auto-detect delimiter
    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    const headerRow = lines[0].split(delimiter).map(h => h.replace(/"/g, ''));
    const dataRows = lines.slice(1);

    const headerMapping = {
        sku: findHeaderIndex(headerRow, ['SKU']),
        item: findHeaderIndex(headerRow, ['Item']),
        description: findHeaderIndex(headerRow, ['Descrição']),
        category: findHeaderIndex(headerRow, ['Des Categoria']),
        netWeight: findHeaderIndex(headerRow, ['Peso Liquido']),
        grossWeight: findHeaderIndex(headerRow, ['Peso Bruto SKU']),
        volume: findHeaderIndex(headerRow, ['Volume m3']),
        height: findHeaderIndex(headerRow, ['Altura']),
        width: findHeaderIndex(headerRow, ['Largura']),
        length: findHeaderIndex(headerRow, ['Comprimento']),
        palletHeight: findHeaderIndex(headerRow, ['Qtd. CX Altura']),
        palletBase: findHeaderIndex(headerRow, ['Qtd. CX Lastro']),
        barcode: findHeaderIndex(headerRow, ['Cod. Barras']),
        packaging: findHeaderIndex(headerRow, ['Caixa']),
        measurementUnit: findHeaderIndex(headerRow, ['Unid Med']),
        quantity: findHeaderIndex(headerRow, ['Qtd. Itens']),
        classification: findHeaderIndex(headerRow, ['Clasificação ABC']),
    };

    if (headerMapping.sku === -1 || headerMapping.description === -1) {
        throw new Error("CSV parsing failed: Missing required headers (SKU or Description).");
    }

    return dataRows.map(line => {
        const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
        
        const getFloat = (index: number) => parseFloat(values[index]?.replace(',', '.') || '0') || 0;
        const getInt = (index: number) => parseInt(values[index] || '0', 10) || 0;

        const h = getFloat(headerMapping.height);
        const w = getFloat(headerMapping.width);
        const l = getFloat(headerMapping.length);
        
        const product: Product = {
            sku: values[headerMapping.sku] || '',
            item: values[headerMapping.item] || '',
            description: values[headerMapping.description] || '',
            category: values[headerMapping.category] || '',
            netWeight: getFloat(headerMapping.netWeight),
            grossWeight: getFloat(headerMapping.grossWeight),
            volume: getFloat(headerMapping.volume),
            dimensions: `${h}x${w}x${l}`,
            palletization: {
                height: getInt(headerMapping.palletHeight),
                base: getInt(headerMapping.palletBase),
            },
            barcode: values[headerMapping.barcode] || '',
            packaging: values[headerMapping.packaging] || '',
            measurementUnit: values[headerMapping.measurementUnit] || '',
            quantity: getInt(headerMapping.quantity),
            classification: values[headerMapping.classification] || '',
            unit,
        };
        return product;
    }).filter(p => p.sku && p.description); // Filter out any empty rows
};

export async function uploadProducts(formData: FormData): Promise<{ error?: string }> {
    const session = await getSession();
    if (session?.user?.role !== 'admin') {
      return { error: 'Acesso não autorizado.' };
    }

    const fileITJ = formData.get('fileITJ') as File | null;
    const fileJVL = formData.get('fileJVL') as File | null;

    if (!fileITJ && !fileJVL) {
        return { error: 'Pelo menos um arquivo (ITJ ou JVL) deve ser enviado.' };
    }

    let allProducts: Product[] = [];

    try {
        // Tenta ler o arquivo JSON existente para mesclar os dados
        const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
        let existingProducts: Product[] = [];
        try {
            const currentData = await fs.readFile(filePath, 'utf-8');
            existingProducts = JSON.parse(currentData);
        } catch (e) {
            // Arquivo não existe ou está vazio, o que é normal na primeira vez
        }

        if (fileITJ && fileITJ.size > 0) {
            const bufferITJ = Buffer.from(await fileITJ.arrayBuffer());
            const contentITJ = bufferITJ.toString('utf-8');
            const productsITJ = parseCSV(contentITJ, 'ITJ');
            // Remove produtos antigos da unidade ITJ antes de adicionar os novos
            existingProducts = existingProducts.filter(p => p.unit !== 'ITJ');
            allProducts = existingProducts.concat(productsITJ);
        }

        if (fileJVL && fileJVL.size > 0) {
            const bufferJVL = Buffer.from(await fileJVL.arrayBuffer());
            const contentJVL = bufferJVL.toString('utf-8');
            const productsJVL = parseCSV(contentJVL, 'JVL');
             // Se já houver produtos de ITJ, mescla. Senão, começa do zero.
            if (allProducts.length > 0) {
                 allProducts = allProducts.filter(p => p.unit !== 'JVL');
                 allProducts = allProducts.concat(productsJVL);
            } else {
                 existingProducts = existingProducts.filter(p => p.unit !== 'JVL');
                 allProducts = existingProducts.concat(productsJVL);
            }
        }
        
        // Escreve os dados combinados e atualizados no arquivo
        await fs.writeFile(filePath, JSON.stringify(allProducts, null, 2), 'utf-8');

    } catch (error) {
        console.error('File processing error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro ao processar os arquivos: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar os arquivos.' };
    }
    
    // Redireciona para a página de produtos após o upload bem-sucedido
    redirect('/dashboard/products');
}
