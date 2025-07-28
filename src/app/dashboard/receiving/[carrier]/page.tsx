
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { isToday, parseISO, format } from 'date-fns';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getSchedulesForCarrier(carrier: string): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const allSchedules: ReturnSchedule[] = JSON.parse(jsonData);
        
        return allSchedules.filter(s => 
            s.carrier === carrier && isToday(parseISO(s.date))
        ).sort((a,b) => a.nfd.localeCompare(b.nfd));

    } catch (error) {
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}

export default async function ConferencePage({ params }: { params: { carrier: string } }) {
    const carrierName = decodeURIComponent(params.carrier);
    const schedules = await getSchedulesForCarrier(carrierName);

    if (schedules.length === 0) {
        return notFound();
    }

    const totalNotes = schedules.length;
    const totalVolume = schedules.reduce((sum, s) => sum + s.invoiceVolume, 0);

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <div className="mb-6 space-y-2">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/receiving">← Voltar para Recebimento</Link>
                </Button>
                <h1 className="text-3xl font-headline font-bold">Conferência de Recebimento</h1>
                <p className="text-xl text-muted-foreground">
                    Transportadora: <span className="font-semibold text-foreground">{carrierName}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{format(parseISO(schedules[0].date), 'dd/MM/yyyy')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Notas (NFDs)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalNotes}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Volumes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalVolume}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Notas Fiscais para Conferência</CardTitle>
                    <CardDescription>Lista de todas as NFDs agendadas para hoje com esta transportadora.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NFD</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Motivo da Devolução</TableHead>
                                    <TableHead>Volumes</TableHead>
                                    <TableHead>Nota de Venda</TableHead>
                                    <TableHead>OV</TableHead>
                                    <TableHead>BDV</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map(schedule => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-mono font-semibold">{schedule.nfd}</TableCell>
                                        <TableCell>{schedule.customer}</TableCell>
                                        <TableCell>{schedule.returnReason}</TableCell>
                                        <TableCell>{schedule.invoiceVolume}</TableCell>
                                        <TableCell>{schedule.salesNote}</TableCell>
                                        <TableCell>{schedule.ov}</TableCell>
                                        <TableCell>{schedule.bdv}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
