"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReturnSchedule } from "@/types";
import { ConferenceForm } from "./conference-form";

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ReturnSchedule | null;
}

export function ConferenceModal({ isOpen, onClose, schedule }: ConferenceModalProps) {
  if (!schedule) return null;

  const handleFinish = () => {
    // Aqui você pode adicionar lógica para o que acontece quando a conferência de uma NF é finalizada
    // Por exemplo, marcar a NF como conferida, etc.
    // Por enquanto, apenas fechamos o modal.
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
          <ConferenceForm schedule={schedule} onFinish={handleFinish} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
