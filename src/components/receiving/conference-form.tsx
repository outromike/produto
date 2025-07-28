
"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { Loader2, CheckIcon, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

const formSchema = z.object({
  product: z.object({
    sku: z.string().min(1, "O produto é obrigatório"),
    description: z.string().min(1, "A descrição é obrigatória"),
  }),
  receivedVolume: z.coerce.number().min(1, "A quantidade de volumes recebidos é obrigatória."),
  productState: z.enum(["Produto Bom", "Descarte", "Avariado", "Recusado"], {
    required_error: "O estado do produto é obrigatório.",
  }),
  observations: z.string().optional(),
}).refine(
    (data) => {
        if (data.productState === "Recusado") {
            return data.observations && data.observations.trim().length > 0;
        }
        return true;
    },
    {
        message: "A observação é obrigatória quando o estado é 'Recusado'.",
        path: ["observations"],
    }
);

type ConferenceFormValues = z.infer<typeof formSchema>;

interface ConferenceFormProps {
  schedule: ReturnSchedule;
  existingConference: ConferenceEntry | null;
  onSave: (conference: ConferenceEntry) => void;
  onCancelEdit: () => void;
}

export function ConferenceForm({ schedule, existingConference, onSave, onCancelEdit }: ConferenceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [productQuery, setProductQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
  
  const selectedProductSku = useWatch({ control: form.control, name: "product.sku" });

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
  }, [existingConference, form.reset]);


  const debouncedProductSearch = useDebouncedCallback(async (query: string) => {
    if (query.length > 2) {
      const results = await findProduct(query);
      setSuggestions(results);
      if(results.length > 0) setIsPopoverOpen(true);
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
            id: existingConference?.id || `${Date.now()}-${Math.random()}`,
            scheduleId: schedule.id,
            nfd: schedule.nfd,
            productSku: values.product.sku,
            productDescription: values.product.description,
            receivedVolume: values.receivedVolume,
            productState: values.productState,
            observations: values.observations || "",
            conferenceTimestamp: new Date().toISOString(),
        };

        const result = await saveConference(conferenceData);

        if (result.success && result.savedConference) {
            toast({ title: "Sucesso!", description: `Item ${existingConference ? 'atualizado' : 'salvo'} com sucesso.` });
            onSave(result.savedConference);
            form.reset({
              product: { sku: "", description: "" },
              receivedVolume: 1,
              productState: "Produto Bom",
              observations: "",
            });
            setProductQuery("");
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4 p-1">
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
                        autoComplete="off"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                    <Command filter={() => 1}>
                      <CommandInput
                        placeholder="Buscar produto..."
                        value={productQuery}
                        onValueChange={handleProductSearch}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {suggestions.map((product, index) => (
                            <CommandItem
                              key={product.sku + '-' + index}
                              value={`${product.sku} - ${product.description}`}
                              onSelect={() => handleProductSelect(product)}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductSku === product.sku ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <p className="text-sm">{product.description}</p>
                                <p className="text-xs text-muted-foreground">{product.sku}</p>
                              </div>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      <SelectItem value="Avariado">Avariado</SelectItem>
                      <SelectItem value="Recusado">Recusado</SelectItem>
                      <SelectItem value="Descarte">Descarte</SelectItem>
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
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adicione observações relevantes..." {...field} rows={2}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            
          <div className="flex justify-end gap-2 pt-2">
            {existingConference && (
                 <Button type="button" variant="ghost" onClick={onCancelEdit}>
                    <CircleX className="mr-2 h-4 w-4" />
                    Cancelar Edição
                </Button>
            )}
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingConference ? 'Salvar Alterações' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
    </Form>
  );
}
