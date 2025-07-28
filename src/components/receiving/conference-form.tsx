"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { ReturnSchedule, Product, ConferenceEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { saveConference, findProduct } from "@/app/dashboard/receiving/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

const formSchema = z.object({
  product: z.object({
    sku: z.string().min(1, "O produto é obrigatório"),
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
  existingConference: ConferenceEntry | null;
  onFinish: () => void;
  onConferenceSaved: (conference: ConferenceEntry) => void;
}

export function ConferenceForm({ schedule, existingConference, onFinish, onConferenceSaved }: ConferenceFormProps) {
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

  useEffect(() => {
    if (existingConference) {
      form.reset({
        product: {
          sku: existingConference.productSku,
          description: existingConference.productDescription,
        },
        receivedVolume: existingConference.receivedVolume,
        productState: existingConference.productState,
        observations: existingConference.observations,
      });
      setProductQuery(existingConference.productDescription)
    } else {
        form.reset({
            product: { sku: "", description: "" },
            receivedVolume: 1,
            productState: "Produto Bom",
            observations: "",
          });
        setProductQuery("")
    }
  }, [existingConference, form]);


  const debouncedProductSearch = useDebouncedCallback(async (query: string) => {
    if (query.length > 2) {
      const results = await findProduct(query);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, 300);

  const handleProductSearch = (query: string) => {
      setProductQuery(query);
      debouncedProductSearch(query);
  };

  const handleProductSelect = (product: Product) => {
    form.setValue("product", { sku: product.sku, description: product.description });
    setProductQuery(product.description);
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const processSubmit = (values: ConferenceFormValues) => {
    startTransition(async () => {
        const conferenceData = {
            id: existingConference?.id || `${new Date().getTime()}-${Math.random()}`,
            scheduleId: schedule.id,
            nfd: schedule.nfd,
            productSku: values.product.sku,
            productDescription: values.product.description,
            receivedVolume: values.receivedVolume,
            productState: values.productState,
            observations: values.observations || "",
            conferenceTimestamp: existingConference?.conferenceTimestamp || new Date().toISOString(),
        };

        const result = await saveConference(conferenceData);

        if (result.success && result.savedConference) {
            toast({ title: "Sucesso!", description: `Conferência ${existingConference ? 'atualizada' : 'salva'} com sucesso.` });
            onConferenceSaved(result.savedConference);
            if (!existingConference) { 
                form.reset({
                    product: { sku: "", description: "" },
                    receivedVolume: 1,
                    productState: "Produto Bom",
                    observations: "",
                });
                setProductQuery("");
            }
            setShowPartialReceiptAlert(false);
            setFormData(null);
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  const onSubmit = (values: ConferenceFormValues) => {
    if (values.receivedVolume !== schedule.invoiceVolume && !existingConference) {
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
  
  const selectedProductSku = form.watch('product.sku');

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="product.sku"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Produto (SKU, Item ou Descrição)</FormLabel>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Input
                        placeholder="Digite para buscar..."
                        value={productQuery}
                        onChange={(e) => handleProductSearch(e.target.value)}
                        onClick={() => setIsPopoverOpen(true)}
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                    <Command filter={() => 1}>
                      <CommandInput
                        placeholder="Buscar produto..."
                        value={productQuery}
                        onValueChange={handleProductSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {suggestions.map((product, index) => (
                            <CommandItem
                              key={product.sku + '-' + index}
                              value={`${product.description} ${product.sku} ${product.item}`}
                              onSelect={() => handleProductSelect(product)}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductSku === product.sku ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {product.description}
                              <span className="text-xs text-muted-foreground ml-2">({product.sku})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <Button type="button" variant="outline" onClick={onFinish}>
                {existingConference ? "Fechar" : "Finalizar Conferência da NF"}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingConference ? 'Salvar Alterações' : 'Salvar Produto'}
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
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Sim, receber parcialmente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
