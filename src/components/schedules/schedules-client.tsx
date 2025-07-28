
"use client";

import { useState, useMemo } from 'react';
import { ReturnSchedule } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleForm } from "./schedule-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTable } from "./schedule-table";
import { isToday, parseISO } from 'date-fns';
import { deleteSchedule, deleteSchedules } from '@/app/dashboard/schedules/actions';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';

const transportadoras = [
    "ALFA", "AND", "BERTOLINI", "CROSS", "EXPRESSO SÃO MIGUEL", "LFG", "RODONAVES", 
    "SOLÍSTICA", "TECMAR", "TESBA", "TRANSLOVATO", "TRANSOLIVEIRA", "TRANSBEN", 
    "ZAZ", "COTAÇÃO"
];
  
const motivosDevolucao = [
    "Acordo Comercial Gerente", "Atendimento em Garantia", "Atraso na Entrega Expedição",
    "Cliente desistiu da compra", "Cliente não fez pedido", "Cliente solicitou incorreto",
    "Defeito Técnico", "Divergência no endereço de entrega", "Extravio",
    "Falta Parcial de Mercadoria", "Inversão de Mercadoria", "Motivos Comerciais",
    "Avaria na Transportadora", "Sobra de Mercadoria", "Vendedor solicitou incorreto",
    "Stock Rotation", "Decurso de Prazo", "Não informado", "______"
];

interface SchedulesClientProps {
  initialSchedules: ReturnSchedule[];
}

export function SchedulesClient({ initialSchedules }: SchedulesClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ReturnSchedule | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    query: '',
    carrier: 'all',
    returnReason: 'all',
  });

  const handleFilterChange = useDebouncedCallback((key: string, value: string) => {
    setFilters(prev => ({...prev, [key]: value}));
  }, 300);

  const filteredSchedules = useMemo(() => {
    return initialSchedules.filter(s => {
      const queryLower = filters.query.toLowerCase();
      const searchMatch = filters.query ? 
        s.customer.toLowerCase().includes(queryLower) ||
        s.nfd.toLowerCase().includes(queryLower) ||
        s.salesNote?.toLowerCase().includes(queryLower) ||
        s.outgoingShipment?.toLowerCase().includes(queryLower)
        : true;
      
      const carrierMatch = filters.carrier !== 'all' ? s.carrier === filters.carrier : true;
      const reasonMatch = filters.returnReason !== 'all' ? s.returnReason === filters.returnReason : true;

      return searchMatch && carrierMatch && reasonMatch;
    });
  }, [initialSchedules, filters]);


  const todaySchedules = filteredSchedules.filter(s => isToday(parseISO(s.date)));
  const otherSchedules = filteredSchedules.filter(s => !isToday(parseISO(s.date)));

  const handleEdit = (schedule: ReturnSchedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (schedule: ReturnSchedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    setIsDeleting(true);
    const result = await deleteSchedule(selectedSchedule.id);
    if (result.success) {
      toast({ title: "Sucesso!", description: "Agendamento excluído." });
      window.location.reload(); // Recarrega a página para evitar problemas de sessão
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
    setIsDeleteAlertOpen(false);
    setSelectedSchedule(null);
  };
  
  const handleBulkDeleteRequest = () => {
    setIsBulkDeleteAlertOpen(true);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const result = await deleteSchedules(selectedSchedules);
     if (result.success) {
      toast({ title: "Sucesso!", description: `${selectedSchedules.length} agendamento(s) excluído(s).` });
      window.location.reload(); // Recarrega a página para evitar problemas de sessão
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
    setIsBulkDeleteAlertOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
        setSelectedSchedule(null);
        // Não recarrega mais aqui para dar chance da ação do servidor concluir
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-headline font-bold">Agendamentos de Devolução</h1>
        <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
             <Button onClick={() => {
                setSelectedSchedule(null);
                setIsFormOpen(true);
            }}>
              <PlusCircle className="mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSchedule ? 'Editar Agendamento' : 'Criar Novo(s) Agendamento(s)'}</DialogTitle>
            </DialogHeader>
            <ScheduleForm setOpen={setIsFormOpen} initialData={selectedSchedule} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input 
                placeholder="Buscar por cliente, NFD, remessa..."
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="lg:col-span-2"
            />
            <Select onValueChange={(value) => handleFilterChange('carrier', value)} defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Transportadora" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Transportadoras</SelectItem>
                    {transportadoras.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleFilterChange('returnReason', value)} defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Motivo da Devolução" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Motivos</SelectItem>
                    {motivosDevolucao.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         {selectedSchedules.length > 0 && (
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{selectedSchedules.length} agendamento(s) selecionado(s)</span>
                 <Button variant="destructive" size="sm" onClick={handleBulkDeleteRequest}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Selecionados
                </Button>
            </div>
        )}
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="all">Outros Agendamentos</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <ScheduleTable schedules={todaySchedules} onEdit={handleEdit} onDelete={handleDeleteRequest} selectedSchedules={selectedSchedules} setSelectedSchedules={setSelectedSchedules}/>
        </TabsContent>
        <TabsContent value="all">
          <ScheduleTable schedules={otherSchedules} onEdit={handleEdit} onDelete={handleDeleteRequest} selectedSchedules={selectedSchedules} setSelectedSchedules={setSelectedSchedules}/>
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

      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Excluir agendamentos?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente os <strong>{selectedSchedules.length}</strong> agendamentos selecionados.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Excluindo...</> : 'Sim, excluir'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
