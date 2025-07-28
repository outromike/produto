
"use client";

import { useState, useMemo, useEffect } from "react";
import { ReturnSchedule, ConferenceEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO, isToday } from "date-fns";
import { ConferenceModal } from "./conference-modal";
import { CheckCircle2, Pencil, FileClock, Calendar, Box, Hash, XCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

interface ConferenceClientProps {
  initialSchedules: ReturnSchedule[];
  carrierName: string;
  initialConferences: ConferenceEntry[];
}

export function ConferenceClient({ initialSchedules, carrierName, initialConferences }: ConferenceClientProps) {
  const [conferences, setConferences] = useState<ConferenceEntry[]>(initialConferences);

  const [selectedSchedule, setSelectedSchedule] = useState<ReturnSchedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewAlertOpen, setIsReviewAlertOpen] = useState(false);

  const schedulesForToday = useMemo(() => {
    return initialSchedules.filter(s => isToday(parseISO(s.date)))
  }, [initialSchedules]);

  
  const conferencedNfds = useMemo(() => {
    const nfdMap = new Map<string, string>(); // nfd -> status
    conferences.forEach(c => {
      if (c.productState === "Recusa Total") {
        nfdMap.set(c.nfd, "rejected");
      } else if (!nfdMap.has(c.nfd)) {
        nfdMap.set(c.nfd, "conferenced");
      }
    });
    return nfdMap;
  }, [conferences]);

  const totalNotes = schedulesForToday.length;
  const totalVolume = schedulesForToday.reduce((sum, s) => sum + s.invoiceVolume, 0);

  const handleRowClick = (schedule: ReturnSchedule) => {
    if (conferencedNfds.get(schedule.nfd) === 'rejected') {
      return; // Do not open modal for fully rejected notes
    }
    setSelectedSchedule(schedule);
    if (conferencedNfds.has(schedule.nfd)) {
      setIsReviewAlertOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  }

  const handleConferenceUpdate = (updatedConference: ConferenceEntry) => {
    const newConferences = conferences.map(c => c.id === updatedConference.id ? updatedConference : c);
    setConferences(newConferences);
    if (!conferencedNfds.has(updatedConference.nfd)) {
        setConferences(prev => [...prev, updatedConference]);
    }
  };

  const handleConferenceAdd = (newConference: ConferenceEntry) => {
     setConferences(prev => [...prev, newConference]);
  }

  const handleConferenceDelete = (deletedConferenceId: string) => {
    setConferences(prev => prev.filter(c => c.id !== deletedConferenceId));
  }

  const handleRejectAll = (nfd: string) => {
    const rejectionEntry: ConferenceEntry = {
        id: `${Date.now()}`,
        nfd,
        productState: 'Recusa Total',
        // Fill other fields with placeholder data as they are not relevant for a full rejection
        scheduleId: selectedSchedule?.id || '',
        productSku: 'N/A',
        productDescription: 'Recusa Total da Nota Fiscal',
        receivedVolume: 0,
        allocatedVolume: 0,
        observations: '',
        conferenceTimestamp: new Date().toISOString(),
    };
    // Remove existing and add the rejection marker
    setConferences(prev => [...prev.filter(c => c.nfd !== nfd), rejectionEntry]);
  };

  const conferencesForSelectedNfd = useMemo(() => {
    if (!selectedSchedule) return [];
    return conferences.filter(c => c.nfd === selectedSchedule.nfd);
  }, [selectedSchedule, conferences]);

  // Early return if no schedules are available for the carrier today.
  if (schedulesForToday.length === 0) {
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
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center">
                <FileClock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground">
                    Sem Agendamentos para Hoje
                </h3>
                <p className="mt-2 text-muted-foreground">Não há notas fiscais agendadas para esta transportadora na data de hoje.</p>
            </div>
        </main>
    )
  }

  const renderStatusIcon = (nfd: string) => {
    const status = conferencedNfds.get(nfd);
    if (status === 'rejected') {
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (status === 'conferenced') {
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <Pencil className="h-4 w-4 text-yellow-500" />;
  }

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

        <div className="mb-8 flex flex-col items-stretch gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground"/>
                <div className="text-sm">
                    <span className="text-muted-foreground">Data:</span>{' '}
                    <span className="font-bold">{format(parseISO(schedulesForToday[0].date), 'dd/MM/yyyy')}</span>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground"/>
                <div className="text-sm">
                    <span className="text-muted-foreground">Total de Notas (NFDs):</span>{' '}
                    <span className="font-bold">{totalNotes}</span>
                </div>
            </div>
             <div className="flex items-center gap-3">
                <Box className="h-5 w-5 text-muted-foreground"/>
                <div className="text-sm">
                    <span className="text-muted-foreground">Total de Volumes:</span>{' '}
                    <span className="font-bold">{totalVolume}</span>
                </div>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais para Conferência</CardTitle>
            <CardDescription>Clique em uma nota fiscal para registrar ou revisar os produtos recebidos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">NFD</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Motivo da Devolução</TableHead>
                    <TableHead>Volumes</TableHead>
                    <TableHead className="hidden md:table-cell">Nota de Venda</TableHead>
                    <TableHead className="hidden md:table-cell">OV</TableHead>
                    <TableHead className="hidden md:table-cell">BDV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedulesForToday.map(schedule => (
                    <TableRow 
                      key={schedule.id} 
                      onClick={() => handleRowClick(schedule)} 
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono font-semibold">
                        <div className="flex items-center gap-2">
                           {renderStatusIcon(schedule.nfd)}
                          <span>{schedule.nfd}</span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">{schedule.returnReason}</TableCell>
                      <TableCell>{schedule.invoiceVolume}</TableCell>
                      <TableCell className="hidden md:table-cell">{schedule.salesNote}</TableCell>
                      <TableCell className="hidden md:table-cell">{schedule.ov}</TableCell>
                      <TableCell className="hidden md:table-cell">{schedule.bdv}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {selectedSchedule && (
        <ConferenceModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            schedule={selectedSchedule}
            initialConferencesForNfd={conferencesForSelectedNfd}
            onConferenceAdd={handleConferenceAdd}
            onConferenceUpdate={handleConferenceUpdate}
            onConferenceDelete={handleConferenceDelete}
            onRejectAll={handleRejectAll}
        />
      )}

      <AlertDialog open={isReviewAlertOpen} onOpenChange={setIsReviewAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Revisar Conferência?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta nota fiscal já foi conferida. Deseja revisar ou editar os itens lançados?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Não</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                      setIsReviewAlertOpen(false);
                      setIsModalOpen(true);
                  }}>
                      Sim, Revisar
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
