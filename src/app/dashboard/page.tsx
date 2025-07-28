
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, PackageSearch, CalendarClock, Inbox } from 'lucide-react';

const hubLinks = [
    {
      href: "/dashboard/analytics",
      icon: AreaChart,
      title: "Dashboard de Análises",
      description: "Visualize gráficos e métricas sobre o inventário de produtos.",
    },
    {
      href: "/dashboard/products",
      icon: PackageSearch,
      title: "Consulta de Produtos",
      description: "Pesquise, filtre e explore todos os produtos cadastrados.",
    },
    {
        href: "/dashboard/schedules",
        icon: CalendarClock,
        label: "Agendamentos",
        title: "Agendamentos",
        description: "Gerencie e crie novos agendamentos de devolução de notas.",
    },
    {
        href: "/dashboard/receiving",
        icon: Inbox,
        label: "Recebimento",
        title: "Recebimento",
        description: "Inicie e acompanhe a conferência de notas fiscais recebidas.",
    },
  ];

export default function DashboardHubPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-headline font-bold">Bem-vindo(a) ao seu Painel</h1>
            <p className="text-lg text-muted-foreground">Selecione uma das opções abaixo para começar.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {hubLinks.map((link) => (
                 <Link key={link.href} href={link.href} className="group">
                    <Card className="flex h-full flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <link.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{link.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           <CardDescription>{link.description}</CardDescription>
                        </CardContent>
                    </Card>
                 </Link>
            ))}
        </div>
    </main>
  );
}
