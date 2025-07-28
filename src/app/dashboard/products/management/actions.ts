
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

async function getProducts(): Promise<Product[]> {
    try {
        const jsonData = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading products.json:", error);
        return [];
    }
}

async function saveProducts(products: Product[]): Promise<void> {
    await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
    revalidatePath('/dashboard/products/management');
    revalidatePath('/dashboard/products');
}

export async function addProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    try {
        const products = await getProducts();
        const existingProduct = products.find(p => p.sku === product.sku);
        if (existingProduct) {
            return { success: false, error: 'Um produto com este SKU já existe.' };
        }
        products.push(product);
        await saveProducts(products);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Falha ao salvar o produto.' };
    }
}

export async function updateProduct(sku: string, productData: Product): Promise<{ success: boolean; error?: string }> {
    try {
        let products = await getProducts();
        const productIndex = products.findIndex(p => p.sku === sku);

        if (productIndex === -1) {
            return { success: false, error: 'Produto não encontrado para atualização.' };
        }

        products[productIndex] = { ...products[productIndex], ...productData };
        await saveProducts(products);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Falha ao atualizar o produto.' };
    }
}


export async function deleteProduct(sku: string): Promise<{ success: boolean; error?: string }> {
    try {
        let products = await getProducts();
        const updatedProducts = products.filter(p => p.sku !== sku);

        if (products.length === updatedProducts.length) {
            return { success: false, error: "Produto não encontrado para exclusão." };
        }
        
        await saveProducts(updatedProducts);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Falha ao excluir o produto.' };
    }
}

export async function findProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }
    const products = await getProducts();
    const lowerCaseQuery = query.toLowerCase();
    
    return products.filter(p => 
        p.sku.toLowerCase().includes(lowerCaseQuery) ||
        p.description.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 15); // Limit to 15 results for performance
}

