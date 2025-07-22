import { Product } from '@/types';
import productsData from '@/data/products.json';

// As the data is now static, we can import it directly.
const allProducts: Product[] = productsData as Product[];

export async function getProducts(): Promise<Product[]> {
  // The data is already loaded, so we just return it.
  return allProducts;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
