
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useToast } from "@/hooks/use-toast";
import { ReturnSchedule } from "@/types";
import { updateSchedulesStatus } from "@/app/dashboard/schedules/actions";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ReturnSchedule[];
  carrierName: string;
}

const formSchema = z.object({
  nfdIds: z.array(z.string()).nonempty({ message: "Selecione pelo menos uma NFD." }),
  destination: z.string().min(1, "O destino é obrigatório."),
  remessas: z.record(z.string()).optional(), // To hold manually entered shipment numbers
}).refine((data) => {
    // Custom validation to ensure remessa is provided if needed
    for (const nfdId of data.nfdIds) {
      if (data.remessas?.[nfdId] === "") {
        return false; // Invalid if remessa is required and empty
      }
    }
    return true;
}, {
    message: "O número da remessa é obrigatório.",
    path: ["remessas"], // Generic path, specific error handling is done in the component
});

type FormValues = z.infer<typeof formSchema>;

export function DestinationModal({ isOpen, onClose, schedules, carrierName }: DestinationModalProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nfdIds: [],
            destination: "",
            remessas: {},
        },
    });

    const selectedNfdIds = form.watch("nfdIds");

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
           const result = await updateSchedulesStatus(values.nfdIds, values.destination, values.remessas);
           if (result.success) {
               toast({ title: "Sucesso!", description: "NFDs foram destinadas com sucesso." });
               onClose();
           } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" });
           }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Destinar Produtos de {carrierName}</DialogTitle>
                    <DialogDescription>
                        Selecione as NFDs com BDV que deseja destinar e escolha o local de envio.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="nfdIds"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">NFDs Elegíveis (com BDV)</FormLabel>
                                    </div>
                                    <div className="space-y-2">
                                        {schedules.map((schedule) => (
                                            <FormField
                                                key={schedule.id}
                                                control={form.control}
                                                name="nfdIds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                                                         <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(schedule.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                    ? field.onChange([...field.value, schedule.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== schedule.id
                                                                        )
                                                                    )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal w-full">
                                                            <div className="flex justify-between items-center">
                                                                <span>NFD: {schedule.nfd}</span>
                                                                <span className="text-xs text-muted-foreground">{schedule.customer}</span>
                                                            </div>
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedNfdIds.length > 0 && schedules.filter(s => selectedNfdIds.includes(s.id) && !s.outgoingShipment).length > 0 && (
                             <div className="space-y-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-4">
                                 <FormLabel>Preencher Remessas de Saída</FormLabel>
                                {schedules.filter(s => selectedNfdIds.includes(s.id) && !s.outgoingShipment).map(schedule => (
                                    <FormField
                                        key={`remessa-${schedule.id}`}
                                        control={form.control}
                                        name={`remessas.${schedule.id}`}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-muted-foreground">NFD: {schedule.nfd}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Digite o número da remessa"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                        

                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destino</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um destino" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Multiog">Enviar para Multiog</SelectItem>
                                            <SelectItem value="Joinville">Enviar para Joinville</SelectItem>
                                            <SelectItem value="Descarte">Enviar para Descarte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Confirmar Destino
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
