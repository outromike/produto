
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConferenceEntry, ReturnSchedule } from "@/types";
import { ConferenceForm } from "./conference-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Pencil, AlertTriangle, BadgeAlert } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteConference } from "@/app/dashboard/receiving/actions";
import { useToast } from "@/hooks/use-toast";


interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ReturnSchedule | null;
  initialConferencesForNfd: ConferenceEntry[];
  onConferenceUpdate: (conference: ConferenceEntry) => void;
  onConferenceAdd: (conference: ConferenceEntry) => void;
  onConferenceDelete: (conferenceId: string) => void;
}

export function ConferenceModal({ 
  isOpen, 
  onClose, 
  schedule, 
  initialConferencesForNfd,
  onConferenceAdd,
  onConferenceUpdate,
  onConferenceDelete,
}: ConferenceModalProps) {
  
  const [conferences, setConferences] = useState(initialConferencesForNfd);
  const [entryToEdit, setEntryToEdit] = useState<ConferenceEntry | null>(null);
  const [showPartialReceiptAlert, setShowPartialReceiptAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setConferences(initialConferencesForNfd);
    setEntryToEdit(null); // Reset edit state when modal opens/changes
  }, [initialConferencesForNfd]);
  
  if (!schedule) return null;

  const totalReceivedVolume = conferences.reduce((sum, entry) => sum + entry.receivedVolume, 0);

  const handleFinishConference = () => {
    if (totalReceivedVolume !== schedule.invoiceVolume) {
        setShowPartialReceiptAlert(true);
    } else {
        onClose();
    }
  };

  const handleForceClose = () => {
    setShowPartialReceiptAlert(false);
    onClose();
  };

  const handleSave = (entry: ConferenceEntry) => {
    if(entryToEdit) {
      // It's an update
      const updatedConferences = conferences.map(c => c.id === entry.id ? entry : c);
      setConferences(updatedConferences);
      onConferenceUpdate(entry);
    } else {
      // It's a new entry
      setConferences([...conferences, entry]);
      onConferenceAdd(entry);
    }
    setEntryToEdit(null); // Reset form
  };
  
  const handleDelete = async (conferenceId: string) => {
    const result = await deleteConference(conferenceId);
    if(result.success) {
      toast({ title: "Sucesso", description: "Item removido da conferência." });
      setConferences(conferences.filter(c => c.id !== conferenceId));
      onConferenceDelete(conferenceId);
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Conferência da NFD: {schedule.nfd}
            </DialogTitle>
            <DialogDescription>
              Registre os produtos recebidos. A validação do volume total só ocorre ao finalizar a conferência.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Registrar Produto</h3>
                <ConferenceForm 
                  schedule={schedule}
                  existingConference={entryToEdit}
                  onSave={handleSave}
                  onCancelEdit={() => setEntryToEdit(null)}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Produtos Conferidos ({conferences.length})</h3>
                <div className="flex justify-between items-center text-sm font-medium p-2 bg-muted rounded-md">
                    <span>Volumes na Nota Fiscal: <span className="font-bold">{schedule.invoiceVolume}</span></span>
                    <span>Volumes Recebidos: <span className="font-bold">{totalReceivedVolume}</span></span>
                </div>
                {totalReceivedVolume !== schedule.invoiceVolume && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                        <BadgeAlert className="h-4 w-4" />
                        Atenção: A soma dos volumes recebidos diverge do total da nota.
                    </div>
                )}
                <ScrollArea className="h-72 rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Vol.</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conferences.length > 0 ? conferences.map(c => (
                            <TableRow key={c.id}>
                              <TableCell className="text-xs">
                                <p className="font-medium">{c.productDescription}</p>
                                <p className="text-muted-foreground">SKU: {c.productSku}</p>
                              </TableCell>
                              <TableCell>{c.receivedVolume}</TableCell>
                              <TableCell><span className="text-xs">{c.productState}</span></TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEntryToEdit(c)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              Nenhum produto conferido para esta NFD.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </ScrollArea>
              </div>
          </div>
           <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="button" onClick={handleFinishConference}>
                    Finalizar Conferência da NF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showPartialReceiptAlert} onOpenChange={setShowPartialReceiptAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Recebimento Parcial
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div>A quantidade total de volumes informada diverge do agendamento.</div>
              <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                <div><strong>Volumes Agendados na NF:</strong> {schedule.invoiceVolume}</div>
                <div><strong>Total de Volumes Recebidos:</strong> {totalReceivedVolume}</div>
              </div>
              <div className="mt-4 font-semibold">Deseja finalizar a conferência mesmo assim?</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceClose} className="bg-primary hover:bg-primary/90">
              Sim, finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
