import { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
                <ProductCard key={`${product.sku}-${index}`} product={product} />
            ))}
        </div>
    );
}
