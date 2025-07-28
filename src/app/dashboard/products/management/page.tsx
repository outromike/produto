
import { getSession } from "@/lib/auth";
import { AccessDenied } from "@/components/auth/access-denied";
import { getProducts } from '@/lib/products';
import { ProductManagementClient } from "@/components/products/product-management-client";

export default async function ProductManagementPage() {
    const session = await getSession();
    if (!session.user?.permissions.productManagement) {
        return <AccessDenied />;
    }

    const products = await getProducts();

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <ProductManagementClient initialProducts={products} />
        </main>
    );
}
