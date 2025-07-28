"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReturnSchedule } from "@/types";
import { ConferenceForm } from "./conference-form";

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ReturnSchedule | null;
  onConferenceSaved: (nfd: string) => void;
}

export function ConferenceModal({ isOpen, onClose, schedule, onConferenceSaved }: ConferenceModalProps) {
  if (!schedule) return null;

  const handleFinish = () => {
    // A conferência de uma nota pode envolver vários produtos, então o fechamento
    // é uma ação manual do usuário no botão "Finalizar" do formulário.
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conferência da NFD: {schedule.nfd}</DialogTitle>
          <DialogDescription>
            Registre os produtos recebidos para esta nota fiscal.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ConferenceForm 
            schedule={schedule} 
            onFinish={handleFinish} 
            onConferenceSaved={() => onConferenceSaved(schedule.nfd)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}