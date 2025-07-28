
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addSchedule, updateSchedule } from "@/app/dashboard/schedules/actions";
import { Loader2 } from "lucide-react";
import { ReturnSchedule } from "@/types";

const formSchema = z.object({
  date: z.string().min(1, "A data é obrigatória."),
  carrier: z.string().min(1, "A transportadora é obrigatória."),
  outgoingShipment: z.string().optional(),
  salesNote: z.string().optional(),
  nfd: z.string().min(1, "O número da NFD é obrigatório."),
  customer: z.string().min(1, "O nome do cliente é obrigatório."),
  bdv: z.string().optional(),
  ov: z.string().optional(),
  returnReason: z.string().min(1, "O motivo da devolução é obrigatório."),
  productState: z.string().min(1, "O estado do produto é obrigatório."),
  invoiceVolume: z.coerce.number().min(0, "O volume deve ser um número positivo."),
});

type ScheduleFormValues = z.infer<typeof formSchema>;

interface ScheduleFormProps {
    setOpen: (open: boolean) => void;
    initialData?: ReturnSchedule;
}

export function ScheduleForm({ setOpen, initialData }: ScheduleFormProps) {
  const { toast } = useToast();
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        date: initialData.date.split('T')[0] // Garante que a data esteja no formato YYYY-MM-DD
    } : {
      date: new Date().toISOString().split('T')[0],
      carrier: "",
      outgoingShipment: "",
      salesNote: "",
      nfd: "",
      customer: "",
      bdv: "",
      ov: "",
      returnReason: "",
      productState: "",
      invoiceVolume: 0,
    },
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    const result = initialData
      ? await updateSchedule(initialData.id, data)
      : await addSchedule(data);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: `Agendamento ${initialData ? 'atualizado' : 'criado'} com sucesso.`,
        variant: 'default'
      });
      form.reset();
      setOpen(false);
    } else {
      toast({
        title: "Erro",
        description: result.error || `Não foi possível ${initialData ? 'atualizar' : 'criar'} o agendamento.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="carrier" render={({ field }) => (
                <FormItem>
                    <FormLabel>Transportadora</FormLabel>
                    <FormControl><Input placeholder="Nome da transportadora" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="customer" render={({ field }) => (
                <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl><Input placeholder="Nome do cliente" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="nfd" render={({ field }) => (
                <FormItem>
                    <FormLabel>NFD (Nota de Devolução)</FormLabel>
                    <FormControl><Input placeholder="Número da NFD" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="salesNote" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nota Venda</FormLabel>
                    <FormControl><Input placeholder="Número da nota de venda" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="outgoingShipment" render={({ field }) => (
                <FormItem>
                    <FormLabel>Remessa de Saída</FormLabel>
                    <FormControl><Input placeholder="Número da remessa" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="bdv" render={({ field }) => (
                <FormItem>
                    <FormLabel>BDV</FormLabel>
                    <FormControl><Input placeholder="Número do BDV" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="ov" render={({ field }) => (
                <FormItem>
                    <FormLabel>OV</FormLabel>
                    <FormControl><Input placeholder="Número do OV" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="invoiceVolume" render={({ field }) => (
                <FormItem>
                    <FormLabel>Vol. NF</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="returnReason" render={({ field }) => (
                <FormItem className="lg:col-span-2">
                    <FormLabel>Motivo da Devolução</FormLabel>
                    <FormControl><Input placeholder="Ex: Produto avariado" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="productState" render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado do Produto</FormLabel>
                    <FormControl><Input placeholder="Ex: Lacrado, Aberto" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
