"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { ReturnSchedule, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { saveConference, findProduct } from "@/app/dashboard/receiving/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const formSchema = z.object({
  product: z.object({
    sku: z.string().min(1, "O SKU é obrigatório"),
    description: z.string().min(1, "A descrição é obrigatória"),
  }),
  receivedVolume: z.coerce.number().min(1, "A quantidade de volumes recebidos é obrigatória."),
  productState: z.enum(["Produto Bom", "Descarte", "Avariado"], {
    required_error: "O estado do produto é obrigatório.",
  }),
  observations: z.string().optional(),
});

type ConferenceFormValues = z.infer<typeof formSchema>;

interface ConferenceFormProps {
  schedule: ReturnSchedule;
  onFinish: () => void;
}

export function ConferenceForm({ schedule, onFinish }: ConferenceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [productQuery, setProductQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showPartialReceiptAlert, setShowPartialReceiptAlert] = useState(false);
  const [formData, setFormData] = useState<ConferenceFormValues | null>(null);

  const { toast } = useToast();

  const form = useForm<ConferenceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: { sku: "", description: "" },
      receivedVolume: 1,
      productState: "Produto Bom",
      observations: "",
    },
  });

  const handleProductSearch = async (query: string) => {
    setProductQuery(query);
    if (query.length > 1) {
      const results = await findProduct(query);
      setSuggestions(results);
      setIsPopoverOpen(true);
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    form.setValue("product", { sku: product.sku, description: product.description });
    setIsPopoverOpen(false);
  };

  const processSubmit = (values: ConferenceFormValues) => {
    startTransition(async () => {
        const result = await saveConference({
            scheduleId: schedule.id,
            nfd: schedule.nfd,
            productSku: values.product.sku,
            productDescription: values.product.description,
            receivedVolume: values.receivedVolume,
            productState: values.productState,
            observations: values.observations || "",
        });

        if (result.success) {
            toast({ title: "Sucesso!", description: "Conferência salva com sucesso." });
            form.reset(); // Reseta o form para um novo produto
            setShowPartialReceiptAlert(false);
            setFormData(null);
            // Poderíamos chamar onFinish() aqui se quiséssemos fechar o modal após cada salvamento
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  const onSubmit = (values: ConferenceFormValues) => {
    if (values.receivedVolume !== schedule.invoiceVolume) {
        setFormData(values);
        setShowPartialReceiptAlert(true);
    } else {
        processSubmit(values);
    }
  };
  
  const handleForceSubmit = () => {
    if (formData) {
        processSubmit(formData);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto (SKU, Item ou Descrição)</FormLabel>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                        <Input
                            placeholder="Digite para buscar..."
                            value={productQuery}
                            onChange={(e) => handleProductSearch(e.target.value)}
                        />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar produto..." />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {suggestions.map((product) => (
                            <CommandItem
                              key={product.sku}
                              value={`${product.sku} - ${product.description}`}
                              onSelect={() => handleProductSelect(product)}
                            >
                              {product.description} <span className="text-xs text-muted-foreground ml-2">({product.sku})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                 <Input readOnly disabled className="mt-2" placeholder="SKU do produto selecionado" value={field.value.sku} />
                 <Input readOnly disabled className="mt-2" placeholder="Descrição do produto selecionado" value={field.value.description} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="receivedVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volumes Recebidos</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado do Produto</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="Produto Bom">Produto Bom</SelectItem>
                           <SelectItem value="Descarte">Descarte</SelectItem>
                           <SelectItem value="Avariado">Avariado</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações de Recebimento</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adicione observações relevantes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            
          <div className="flex justify-end gap-4 pt-4">
             <Button type="button" variant="outline" onClick={onFinish}>Finalizar Conferência da NF</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Produto
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showPartialReceiptAlert} onOpenChange={setShowPartialReceiptAlert}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    Recebimento Parcial
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mt-2">A quantidade de volumes informada diverge do agendamento.</p>
                     <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                        <p><strong>Volumes Agendados:</strong> {schedule.invoiceVolume}</p>
                        <p><strong>Volumes Informados:</strong> {formData?.receivedVolume}</p>
                     </div>
                     <p className="mt-4 font-semibold">Deseja confirmar o recebimento parcial mesmo assim?</p>
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setFormData(null)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleForceSubmit} disabled={isPending} className="bg-primary hover:bg-primary/90">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/> }
                    Sim, receber parcialmente
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
