import { getProducts } from '@/lib/products';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const products = await getProducts();

  const totalProducts = products.length;
  const uniqueCategories = [...new Set(products.map(p => p.category))].length;
  const productsInItj = products.filter(p => p.unit === 'ITJ').length;
  const productsInJvl = products.filter(p => p.unit === 'JVL').length;

  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const classificationCounts = products.reduce((acc, product) => {
     if (product.classification && ['A', 'B', 'C'].includes(product.classification)) {
        acc[product.classification] = (acc[product.classification] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const classificationChartData = Object.entries(classificationCounts).map(([name, value]) => ({
    name: `Classe ${name}`,
    value,
    fill: name === 'A' ? 'hsl(var(--chart-2))' : name === 'B' ? 'hsl(var(--chart-4))' : 'hsl(var(--chart-1))',
  }));

  const dashboardData = {
    totalProducts,
    uniqueCategories,
    productsInItj,
    productsInJvl,
    categoryChartData,
    classificationChartData,
  };

  return <DashboardClient data={dashboardData} />;
}
