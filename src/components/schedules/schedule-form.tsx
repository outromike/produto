
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addSchedule, updateSchedule } from "@/app/dashboard/schedules/actions";
import { ClipboardPaste, Loader2 } from "lucide-react";
import { ReturnSchedule } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  date: z.string().min(1, "A data é obrigatória."),
  carrier: z.string().min(1, "A transportadora é obrigatória."),
  outgoingShipment: z.string().optional(),
  salesNote: z.string().optional(),
  nfd: z.string().min(1, "Pelo menos uma NFD é obrigatória."),
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
    onScheduleUpdate: (schedule: ReturnSchedule) => void;
    onSchedulesAdd: (schedules: ReturnSchedule[]) => void;
    initialData?: ReturnSchedule | null;
    onDuplicate: (duplicate: ReturnSchedule, formData: ScheduleFormValues) => void;
}

const transportadoras = [
  "ALFA", "AND", "BERTOLINI", "CROSS", "EXPRESSO SÃO MIGUEL", "LFG", "RODONAVES", 
  "SOLÍSTICA", "TECMAR", "TESBA", "TRANSLOVATO", "TRANSOLIVEIRA", "TRANSBEN", 
  "ZAZ", "COTAÇÃO"
];

const motivosDevolucao = [
    "Acordo Comercial Gerente", "Atendimento em Garantia", "Atraso na Entrega Expedição",
    "Cliente desistiu da compra", "Cliente não fez pedido", "Cliente solicitou incorreto",
    "Defeito Técnico", "Divergência no endereço de entrega", "Extravio",
    "Falta Parcial de Mercadoria", "Inversão de Mercadoria", "Motivos Comerciais",
    "Avaria na Transportadora", "Sobra de Mercadoria", "Vendedor solicitou incorreto",
    "Stock Rotation", "Decurso de Prazo", "Não informado", "______"
];

const estadosProduto = ["Avariado", "Descarte", "Produto Bom", "___"];

export function ScheduleForm({ setOpen, initialData, onScheduleUpdate, onSchedulesAdd, onDuplicate }: ScheduleFormProps) {
  const { toast } = useToast();
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        bdv: initialData.bdv === 'SEM BDV' ? '' : initialData.bdv,
        date: initialData.date.split('T')[0]
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
    if (initialData) {
        const result = await updateSchedule(initialData.id, data);
        if (result.success && result.updatedSchedule) {
            toast({ title: "Sucesso!", description: "Agendamento atualizado com sucesso." });
            onScheduleUpdate(result.updatedSchedule);
            setOpen(false);
        } else {
            toast({ title: "Erro", description: result.error || "Não foi possível atualizar o agendamento.", variant: "destructive" });
        }
    } else {
        const result = await addSchedule(data);
        if (result.success && result.createdSchedules) {
            const count = result.createdSchedules.length;
            toast({ title: "Sucesso!", description: `${count} agendamento(s) criado(s) com sucesso.` });
            onSchedulesAdd(result.createdSchedules);
            setOpen(false);
        } else {
            if (result.duplicate) {
                onDuplicate(result.duplicate, data);
            } else {
                toast({ title: "Erro", description: result.error || "Não foi possível criar o(s) agendamento(s).", variant: "destructive" });
            }
        }
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a transportadora" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {transportadoras.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                    <FormLabel className="flex items-center gap-2">
                        NFD (Nota de Devolução)
                        <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                        <Textarea 
                            placeholder="Cole uma ou mais NFDs, separadas por espaço ou quebra de linha." 
                            {...field}
                            rows={initialData ? 1 : 3}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="outgoingShipment" render={({ field }) => (
                <FormItem>
                     <FormLabel className="flex items-center gap-2">
                        Remessa de Saída
                        <ClipboardPaste className="h-4 w-4 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                        <Textarea 
                            placeholder="Cole as remessas, uma por linha (opcional)." 
                            {...field}
                            rows={initialData ? 1 : 3}
                        />
                    </FormControl>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o motivo" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {motivosDevolucao.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="productState" render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado do Produto</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                             {estadosProduto.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Salvar Alterações' : 'Criar Agendamento(s)'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
