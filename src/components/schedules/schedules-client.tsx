
"use client";

import { useState } from 'react';
import { ReturnSchedule } from "@/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScheduleForm } from "./schedule-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleTable } from "./schedule-table";
import { isFuture, isPast, parseISO } from 'date-fns';

interface SchedulesClientProps {
  initialSchedules: ReturnSchedule[];
}

export function SchedulesClient({ initialSchedules }: SchedulesClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const today = new Date();
  
  const futureSchedules = initialSchedules.filter(s => isFuture(parseISO(s.date)) || s.date === today.toISOString().split('T')[0]);
  const pastSchedules = initialSchedules.filter(s => isPast(parseISO(s.date)) && s.date !== today.toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-headline font-bold">Agendamentos de Devolução</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <ScheduleForm setOpen={setIsFormOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="future">
        <TabsList>
          <TabsTrigger value="future">Futuros</TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
        </TabsList>
        <TabsContent value="future">
          <ScheduleTable schedules={futureSchedules} />
        </TabsContent>
        <TabsContent value="past">
          <ScheduleTable schedules={pastSchedules} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
