"use client";

import { useState } from "react";
import { ReturnSchedule, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ConferenceModal } from "./conference-modal";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConferenceClientProps {
  initialSchedules: ReturnSchedule[];
  carrierName: string;
  initialConferencedNfds: string[];
}

export function ConferenceClient({ initialSchedules, carrierName, initialConferencedNfds }: ConferenceClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<ReturnSchedule | null>(null);
  const [completedNfds, setCompletedNfds] = useState<Set<string>>(new Set(initialConferencedNfds));

  const totalNotes = schedules.length;
  const totalVolume = schedules.reduce((sum, s) => sum + s.invoiceVolume, 0);

  const handleConferenceSaved = (nfd: string) => {
    setCompletedNfds(prev => new Set(prev).add(nfd));
  };

  return (
    <>
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

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schedules.length > 0 ? format(parseISO(schedules[0].date), 'dd/MM/yyyy') : 'N/A'}</p>
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
            <CardDescription>Lista de todas as NFDs agendadas para hoje com esta transportadora. Clique em uma para iniciar.</CardDescription>
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
                    <TableRow 
                      key={schedule.id} 
                      onClick={() => setSelectedSchedule(schedule)} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        completedNfds.has(schedule.nfd) && "bg-green-500/10 text-muted-foreground hover:bg-green-500/20"
                      )}
                    >
                      <TableCell className="font-mono font-semibold">
                        <div className="flex items-center gap-2">
                          {completedNfds.has(schedule.nfd) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          <span>{schedule.nfd}</span>
                        </div>
                      </TableCell>
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
      
      <ConferenceModal
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        schedule={selectedSchedule}
        onConferenceSaved={handleConferenceSaved}
      />
    </>
  );
}