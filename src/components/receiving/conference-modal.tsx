"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConferenceEntry, ReturnSchedule } from "@/types";
import { ConferenceForm } from "./conference-form";

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ReturnSchedule | null;
  onConferenceSaved: (conference: ConferenceEntry) => void;
}

export function ConferenceModal({ isOpen, onClose, schedule, onConferenceSaved }: ConferenceModalProps) {
  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conferência da NFD: {schedule.nfd}</DialogTitle>
          <DialogDescription>
            Registre os produtos recebidos para esta nota fiscal. Você pode salvar múltiplos produtos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ConferenceForm 
            schedule={schedule} 
            onFinish={onClose} 
            onConferenceSaved={onConferenceSaved}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
