// src/app/upload/actions.ts
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';
import { redirect } from 'next/navigation';

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
        console.error("CSV parsing failed: Missing required headers (SKU or Description).");
        return [];
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
    const fileITJ = formData.get('fileITJ') as File | null;
    const fileJVL = formData.get('fileJVL') as File | null;

    if (!fileITJ && !fileJVL) {
        return { error: 'Pelo menos um arquivo (ITJ ou JVL) deve ser enviado.' };
    }

    let allProducts: Product[] = [];

    try {
        if (fileITJ) {
            const bufferITJ = Buffer.from(await fileITJ.arrayBuffer());
            const contentITJ = bufferITJ.toString('utf-8');
            const productsITJ = parseCSV(contentITJ, 'ITJ');
            allProducts = allProducts.concat(productsITJ);
        }

        if (fileJVL) {
            const bufferJVL = Buffer.from(await fileJVL.arrayBuffer());
            const contentJVL = bufferJVL.toString('utf-8');
            const productsJVL = parseCSV(contentJVL, 'JVL');
            allProducts = allProducts.concat(productsJVL);
        }

        // Path to save the new JSON file
        const filePath = path.join(process.cwd(), 'src', 'data', 'products1.json');
        
        // Write the combined data to the new file
        await fs.writeFile(filePath, JSON.stringify(allProducts, null, 2), 'utf-8');

    } catch (error) {
        console.error('File processing error:', error);
        return { error: 'Ocorreu um erro ao processar os arquivos. Verifique o console para mais detalhes.' };
    }
    
    // Redirect to products page after successful upload
    redirect('/products');
}
