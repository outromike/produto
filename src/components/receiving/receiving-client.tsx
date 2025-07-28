
"use client";

import { useState, useMemo } from "react";
import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { CarrierCard } from "./carrier-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationWizardModal } from "@/components/rua08/allocation-wizard-modal";
import { Product, ReturnSchedule, StorageEntry, User } from "@/types";
import { DatePicker } from "../ui/date-picker";
import { isToday, parseISO, isSameDay } from 'date-fns';
import { ScheduleTable } from "../schedules/schedule-table";

interface ReceivingClientProps {
  initialSummaries: CarrierScheduleSummary[];
  allSchedules: ReturnSchedule[]; // Pass all schedules for the new tab
  allProducts: Product[];
  initialStorageData: StorageEntry[];
  conferencedNfds: Set<string>;
  rejectedNfds: Set<string>;
  nfdReceivedVolumes: { [key: string]: number };
  user: User;
}

export function ReceivingClient({ 
    initialSummaries, 
    allSchedules,
    allProducts, 
    initialStorageData,
    conferencedNfds,
    rejectedNfds,
    nfdReceivedVolumes,
    user
}: ReceivingClientProps) {
  const [summaries, setSummaries] = useState(initialSummaries);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<CarrierScheduleSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // State for destined schedules table
  const [selectedDestinedIds, setSelectedDestinedIds] = useState<string[]>([]);


  const handleOpenAllocationModal = (summary: CarrierScheduleSummary) => {
    setSelectedSummary(summary);
    setIsAllocationModalOpen(true);
  };
  
  const handleAllocationFinish = () => {
    setIsAllocationModalOpen(false);
    if (selectedSummary) {
      const newSummaries = summaries.map(s => 
        (s.carrier === selectedSummary.carrier && s.date === selectedSummary.date) 
        ? { ...s, isAllocationCompleted: true } 
        : s
      );
      setSummaries(newSummaries);
    }
  };

  const pendingSummaries = summaries.filter(s => {
    return !s.isAllocationCompleted && isToday(parseISO(s.date));
  });

  const completedSummaries = summaries.filter(s => {
      if (!s.isAllocationCompleted) return false;
      if (!selectedDate) return true;
      return isSameDay(parseISO(s.date), selectedDate);
  });
  
  const destinedSchedules = useMemo(() => {
    return allSchedules.filter(s => s.destination);
  }, [allSchedules]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold">Recebimento do Dia</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="allocated">Alocados</TabsTrigger>
            <TabsTrigger value="destined">Destinados</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="pt-4">
            {pendingSummaries.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pendingSummaries.map((summary) => (
                  <CarrierCard 
                    key={`${summary.carrier}-${summary.date}`} 
                    summary={summary} 
                    onAllocate={handleOpenAllocationModal} 
                    permissions={user.permissions}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center mt-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum recebimento pendente para hoje</h3>
                  <p className="text-muted-foreground">Verifique a aba "Alocados" para consultar o histórico.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="allocated" className="pt-4 space-y-4">
             <div className="flex items-center gap-4">
                <DatePicker date={selectedDate} setDate={setSelectedDate} />
             </div>
             {completedSummaries.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {completedSummaries.map((summary) => (
                  <CarrierCard key={`${summary.carrier}-${summary.date}`} summary={summary} onAllocate={() => {}} permissions={user.permissions}/>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center mt-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum item alocado na data selecionada</h3>
                  <p className="text-muted-foreground">Altere a data para consultar o histórico de outras datas.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="destined" className="pt-4">
            {destinedSchedules.length > 0 ? (
                <ScheduleTable 
                    schedules={destinedSchedules}
                    onEdit={() => {}} // Not editable from this view
                    onDelete={() => {}} // Not deletable from this view
                    selectedSchedules={selectedDestinedIds}
                    setSelectedSchedules={setSelectedDestinedIds}
                    conferencedNfds={conferencedNfds}
                    rejectedNfds={rejectedNfds}
                    nfdReceivedVolumes={nfdReceivedVolumes}
                />
            ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center mt-4">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhuma NF foi destinada ainda.</h3>
                    <p className="text-muted-foreground">Os agendamentos destinados aparecerão aqui.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedSummary && (
        <AllocationWizardModal 
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
          onFinish={handleAllocationFinish}
          summary={selectedSummary}
          allProducts={allProducts}
          storageData={initialStorageData}
        />
      )}
    </>
  );
}
