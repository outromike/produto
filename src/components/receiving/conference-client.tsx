"use client";

import { useState } from "react";
import { ReturnSchedule, ConferenceEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ConferenceModal } from "./conference-modal";
import { CheckCircle2, Pencil, AlertTriangle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"

interface ConferenceClientProps {
  initialSchedules: ReturnSchedule[];
  carrierName: string;
  initialConferences: ConferenceEntry[];
}

export function ConferenceClient({ initialSchedules, carrierName, initialConferences }: ConferenceClientProps) {
  const [schedules] = useState(initialSchedules);
  const [conferences, setConferences] = useState(initialConferences);

  const [selectedSchedule, setSelectedSchedule] = useState<ReturnSchedule | null>(null);
  const [conferenceToEdit, setConferenceToEdit] = useState<ConferenceEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewAlertOpen, setIsReviewAlertOpen] = useState(false);
  
  const conferencedNfds = new Set(conferences.map(c => c.nfd));
  const totalNotes = schedules.length;
  const totalVolume = schedules.reduce((sum, s) => sum + s.invoiceVolume, 0);

  const handleRowClick = (schedule: ReturnSchedule) => {
    setSelectedSchedule(schedule);
    const existingConference = conferences.find(c => c.nfd === schedule.nfd);
    
    if (existingConference) {
        setConferenceToEdit(existingConference);
        setIsReviewAlertOpen(true);
    } else {
        setConferenceToEdit(null);
        setIsModalOpen(true);
    }
  };

  const handleStartReview = () => {
    setIsReviewAlertOpen(false);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
    setConferenceToEdit(null);
  }

  const handleConferenceSave = (newOrUpdatedConference: ConferenceEntry) => {
    setConferences(prev => {
        const existingIndex = prev.findIndex(c => c.id === newOrUpdatedConference.id);
        if (existingIndex > -1) {
            const newConferences = [...prev];
            newConferences[existingIndex] = newOrUpdatedConference;
            return newConferences;
        } else {
            return [...prev, newOrUpdatedConference];
        }
    });
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
            <CardDescription>Clique em uma nota fiscal para registrar ou revisar os produtos recebidos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">NFD</TableHead>
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
                      onClick={() => handleRowClick(schedule)} 
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono font-semibold">
                        <div className="flex items-center gap-2">
                          {conferencedNfds.has(schedule.nfd) ? 
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                            <Pencil className="h-4 w-4 text-yellow-500" />
                          }
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
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schedule={selectedSchedule}
        conference={conferenceToEdit}
        onConferenceSaved={handleConferenceSave}
      />

       <AlertDialog open={isReviewAlertOpen} onOpenChange={setIsReviewAlertOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    Revisar Conferência?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Esta NFD já foi conferida. Deseja revisar ou editar as informações registradas?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConferenceToEdit(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleStartReview}>
                    Sim, Revisar
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}