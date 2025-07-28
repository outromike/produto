
"use client";

import { useState } from 'react';
import { ReturnSchedule } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ScheduleForm } from "./schedule-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTable } from "./schedule-table";
import { isToday, parseISO } from 'date-fns';
import { deleteSchedule } from '@/app/dashboard/schedules/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SchedulesClientProps {
  initialSchedules: ReturnSchedule[];
}

export function SchedulesClient({ initialSchedules }: SchedulesClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ReturnSchedule | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const todaySchedules = initialSchedules.filter(s => isToday(parseISO(s.date)));
  const otherSchedules = initialSchedules.filter(s => !isToday(parseISO(s.date)));

  const handleEdit = (schedule: ReturnSchedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = (schedule: ReturnSchedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteAlertOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedSchedule) return;

    setIsDeleting(true);
    const result = await deleteSchedule(selectedSchedule.id);

    if (result.success) {
        toast({
            title: "Sucesso!",
            description: "Agendamento excluído com sucesso.",
        });
        // Força a recarga da página para obter os dados atualizados do servidor.
        router.refresh(); 
    } else {
        toast({
            title: "Erro",
            description: result.error || "Não foi possível excluir o agendamento.",
            variant: "destructive",
        });
    }
    setIsDeleting(false);
    setIsDeleteAlertOpen(false);
    setSelectedSchedule(null);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
        setSelectedSchedule(null);
        // Recarrega a página ao fechar o formulário (seja de criação ou edição) para mostrar os dados atualizados.
        router.refresh();
    }
    setIsFormOpen(open);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-headline font-bold">Agendamentos de Devolução</h1>
        <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSchedule ? 'Editar Agendamento' : 'Criar Novo Agendamento'}</DialogTitle>
            </DialogHeader>
            <ScheduleForm setOpen={setIsFormOpen} initialData={selectedSchedule} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="all">Outros Agendamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <ScheduleTable schedules={todaySchedules} onEdit={handleEdit} onDelete={handleDeleteConfirm}/>
        </TabsContent>
        <TabsContent value="all">
          <ScheduleTable schedules={otherSchedules} onEdit={handleEdit} onDelete={handleDeleteConfirm}/>
        </TabsContent>
      </Tabs>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o agendamento
                        para a transportadora <span className="font-bold">{selectedSchedule?.carrier}</span> do cliente <span className="font-bold">{selectedSchedule?.customer}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Excluindo...</> : 'Sim, excluir'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
