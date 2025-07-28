
"use client";

import { CarrierScheduleSummary } from "@/app/dashboard/receiving/page";
import { CarrierCard } from "./carrier-card";

interface ReceivingClientProps {
  summaries: CarrierScheduleSummary[];
}

export function ReceivingClient({ summaries }: ReceivingClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Recebimento do Dia</h1>
        <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
      </div>

      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {summaries.map((summary) => (
            <CarrierCard key={summary.carrier} summary={summary} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center">
            <h3 className="text-xl font-bold tracking-tight text-foreground">Nenhum agendamento para hoje</h3>
            <p className="text-muted-foreground">Não há recebimentos programados para a data atual.</p>
        </div>
      )}
    </div>
  );
}
