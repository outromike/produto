
import { Product } from '@/types';
import productsData from '@/data/products.json';

// Os dados agora são importados diretamente do arquivo JSON.
// Isso é mais rápido e confiável do que ler e analisar arquivos CSV em cada solicitação.
const allProducts: Product[] = productsData as Product[];

export async function getProducts(): Promise<Product[]> {
  // Retorna os produtos importados. Não é necessário ler arquivos ou usar noStore.
  return allProducts;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
