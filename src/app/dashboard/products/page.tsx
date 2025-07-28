
import { getProducts } from '@/lib/products';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { PaginationComponent } from '@/components/products/pagination';

const PRODUCTS_PER_PAGE = 12;

// A proteção de rota foi movida para o layout.tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const allProducts = await getProducts();

  const query = (searchParams?.query as string) || '';
  const page = parseInt(searchParams?.page as string, 10) || 1;
  const unit = (searchParams?.unit as string) || 'all';
  const classification = (searchParams?.classification as string) || 'all';
  const packaging = (searchParams?.packaging as string) || 'all';
  const category = (searchParams?.category as string) || 'all';

  const filteredProducts = allProducts.filter((product) => {
    const searchMatch =
      query.length > 0
        ? product.sku.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        : true;
    const unitMatch = unit !== 'all' ? product.unit === unit : true;
    const classificationMatch = classification !== 'all' ? product.classification === classification : true;
    const packagingMatch = packaging !== 'all' ? product.packaging === packaging : true;
    const categoryMatch = category !== 'all' ? product.category === category : true;

    return searchMatch && unitMatch && classificationMatch && packagingMatch && categoryMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );
  
  const uniqueCategories = [...new Set(allProducts.map(p => p.category))].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <ProductFilters categories={uniqueCategories} />
        </aside>
        <section className="md:col-span-3">
            {paginatedProducts.length > 0 ? (
                <ProductGrid products={paginatedProducts} />
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum produto encontrado</h3>
                    <p className="text-muted-foreground">Tente ajustar seus critérios de busca ou filtro.</p>
                </div>
            )}
            {totalPages > 1 && (
                <div className="mt-8">
                    <PaginationComponent totalPages={totalPages} />
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
