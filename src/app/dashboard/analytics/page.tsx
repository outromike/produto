
import { getProducts } from '@/lib/products';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function AnalyticsPage() {
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

  const packagingCounts = products.reduce((acc, product) => {
    const packagingType = product.packaging || "Não definido";
    acc[packagingType] = (acc[packagingType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const packagingChartData = Object.entries(packagingCounts).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  const dashboardData = {
    totalProducts,
    uniqueCategories,
    productsInItj,
    productsInJvl,
    categoryChartData,
    packagingChartData,
  };

  return <DashboardClient data={dashboardData} />;
}
