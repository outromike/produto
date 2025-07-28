
"use client";

import { useState } from "react";
import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { CarrierCard } from "./carrier-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationWizardModal } from "@/components/rua08/allocation-wizard-modal";
import { Product, StorageEntry } from "@/types";

interface ReceivingClientProps {
  initialSummaries: CarrierScheduleSummary[];
  allProducts: Product[];
  initialStorageData: StorageEntry[];
}

export function ReceivingClient({ initialSummaries, allProducts, initialStorageData }: ReceivingClientProps) {
  const [summaries, setSummaries] = useState(initialSummaries);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<CarrierScheduleSummary | null>(null);

  const handleOpenAllocationModal = (summary: CarrierScheduleSummary) => {
    setSelectedSummary(summary);
    setIsAllocationModalOpen(true);
  };
  
  const handleAllocationFinish = () => {
    // This is a simple refresh mechanism. A more sophisticated app might refetch data.
    // For now, we just close the modal and the parent page will re-render on next visit.
    setIsAllocationModalOpen(false);
    // Optimistically update the UI
    if (selectedSummary) {
      const newSummaries = summaries.map(s => 
        s.carrier === selectedSummary.carrier ? { ...s, isAllocationCompleted: true } : s
      );
      setSummaries(newSummaries);
    }
  };

  const pendingSummaries = summaries.filter(s => !s.isAllocationCompleted);
  const completedSummaries = summaries.filter(s => s.isAllocationCompleted);

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
          </TabsList>
          <TabsContent value="pending">
            {pendingSummaries.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {pendingSummaries.map((summary) => (
                  <CarrierCard key={summary.carrier} summary={summary} onAllocate={handleOpenAllocationModal} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center mt-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum recebimento pendente</h3>
                  <p className="text-muted-foreground">Não há recebimentos programados para a data atual ou todos já foram alocados.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="allocated">
             {completedSummaries.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {completedSummaries.map((summary) => (
                  <CarrierCard key={summary.carrier} summary={summary} onAllocate={() => {}} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center mt-4">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum item alocado hoje</h3>
                  <p className="text-muted-foreground">Os recebimentos finalizados e alocados aparecerão aqui.</p>
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
