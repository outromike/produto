
import { getProducts } from '@/lib/products';
import { ProductTable } from '@/components/products/product-table';

// A proteção de rota foi movida para o layout.tsx
export default async function ProductsTablePage() {
  const allProducts = await getProducts();
  const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
        <ProductTable products={allProducts} categories={uniqueCategories} />
    </div>
  );
}
