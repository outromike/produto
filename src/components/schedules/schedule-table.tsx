
"use client";

import { ReturnSchedule } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


interface ScheduleTableProps {
  schedules: ReturnSchedule[];
  onEdit: (schedule: ReturnSchedule) => void;
  onDelete: (schedule: ReturnSchedule) => void;
}

export function ScheduleTable({ schedules, onEdit, onDelete }: ScheduleTableProps) {

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Transportadora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>BDV</TableHead>
            <TableHead>Nota Venda</TableHead>
            <TableHead>NFD</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Estado do Produto</TableHead>
            <TableHead>Vol.</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium whitespace-nowrap">{format(new Date(schedule.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{schedule.carrier}</TableCell>
                <TableCell>{schedule.customer}</TableCell>
                <TableCell>{schedule.bdv || "SEM BDV"}</TableCell>
                <TableCell>{schedule.salesNote}</TableCell>
                <TableCell>{schedule.nfd}</TableCell>
                <TableCell>{schedule.returnReason}</TableCell>
                <TableCell>{schedule.productState}</TableCell>
                <TableCell>{schedule.invoiceVolume}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(schedule)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(schedule)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                Nenhum agendamento encontrado para este período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

