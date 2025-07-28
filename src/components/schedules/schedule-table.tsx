
"use client";

import { ReturnSchedule } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface ScheduleTableProps {
  schedules: ReturnSchedule[];
}

export function ScheduleTable({ schedules }: ScheduleTableProps) {

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Transportadora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Nota Venda</TableHead>
            <TableHead>NFD</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Estado do Produto</TableHead>
            <TableHead>Vol.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium whitespace-nowrap">{format(new Date(schedule.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{schedule.carrier}</TableCell>
                <TableCell>{schedule.customer}</TableCell>
                <TableCell>{schedule.salesNote}</TableCell>
                <TableCell>{schedule.nfd}</TableCell>
                <TableCell>{schedule.returnReason}</TableCell>
                <TableCell>{schedule.productState}</TableCell>
                <TableCell>{schedule.invoiceVolume}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum agendamento encontrado para este período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
