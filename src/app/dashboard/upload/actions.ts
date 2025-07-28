
"use server";

import { Product } from '@/types';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDbConnection, setupDatabase } from '@/lib/db';
import { Connection } from 'mysql2/promise';

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
    }).filter(p => p.sku && p.description);
};

async function insertProductsIntoDb(db: Connection, products: Product[]) {
    if (products.length === 0) return;

    const query = `
        INSERT INTO products (sku, item, description, category, netWeight, grossWeight, volume, dimensions, palletizationHeight, palletizationBase, barcode, packaging, measurementUnit, quantity, classification, unit)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        item = VALUES(item),
        description = VALUES(description),
        category = VALUES(category),
        netWeight = VALUES(netWeight),
        grossWeight = VALUES(grossWeight),
        volume = VALUES(volume),
        dimensions = VALUES(dimensions),
        palletizationHeight = VALUES(palletizationHeight),
        palletizationBase = VALUES(palletizationBase),
        barcode = VALUES(barcode),
        packaging = VALUES(packaging),
        measurementUnit = VALUES(measurementUnit),
        quantity = VALUES(quantity),
        classification = VALUES(classification),
        unit = VALUES(unit);
    `;

    const values = products.map(p => [
        p.sku, p.item, p.description, p.category, p.netWeight, p.grossWeight, p.volume,
        p.dimensions, p.palletization.height, p.palletization.base, p.barcode,
        p.packaging, p.measurementUnit, p.quantity, p.classification, p.unit
    ]);

    await db.query(query, [values]);
}

export async function uploadProducts(formData: FormData): Promise<{ error?: string }> {
    const session = await getSession();
    if (session?.user?.username !== 'admin') {
        return { error: 'Acesso negado. Apenas administradores podem fazer upload de arquivos.' };
    }

    const fileITJ = formData.get('fileITJ') as File | null;
    const fileJVL = formData.get('fileJVL') as File | null;

    if (!fileITJ && !fileJVL) {
        return { error: 'Pelo menos um arquivo (ITJ ou JVL) deve ser enviado.' };
    }
    
    let db;
    try {
        db = await getDbConnection();
        await setupDatabase(); // Garante que a infraestrutura do BD esteja pronta
        
        // Opcional: Limpar a tabela antes de inserir novos dados
        // await db.execute('DELETE FROM products');
        
        if (fileITJ) {
            const bufferITJ = Buffer.from(await fileITJ.arrayBuffer());
            const contentITJ = bufferITJ.toString('utf-8');
            const productsITJ = parseCSV(contentITJ, 'ITJ');
            await insertProductsIntoDb(db, productsITJ);
        }

        if (fileJVL) {
            const bufferJVL = Buffer.from(await fileJVL.arrayBuffer());
            const contentJVL = bufferJVL.toString('utf-8');
            const productsJVL = parseCSV(contentJVL, 'JVL');
            await insertProductsIntoDb(db, productsJVL);
        }

    } catch (error) {
        console.error('File processing or database error:', error);
        if (error instanceof Error) {
            return { error: `Ocorreu um erro: ${error.message}` };
        }
        return { error: 'Ocorreu um erro desconhecido ao processar os arquivos.' };
    }
    
    redirect('/dashboard/products');
}
