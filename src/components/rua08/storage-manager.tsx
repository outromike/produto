
"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Product, StorageEntry } from "@/types";
import { addStorageEntry, deleteStorageEntry } from "@/app/dashboard/rua08/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, PlusCircle, Trash2, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";


const formSchema = z.object({
  building: z.string().min(1, "O prédio é obrigatório."),
  level: z.string().min(1, "O nível é obrigatório."),
  nfd: z.string().min(1, "A NFD é obrigatória."),
  salesNote: z.string().optional(),
  shipment: z.string().optional(),
  product: z.object({
      sku: z.string().min(1, "O produto é obrigatório"),
      description: z.string(),
  }),
  quantity: z.coerce.number().min(1, "A quantidade é obrigatória."),
  status: z.string().min(1, "O status é obrigatório."),
});

type StorageFormValues = z.infer<typeof formSchema>;

interface StorageManagerProps {
    initialProducts: Product[];
    initialStorageData: StorageEntry[];
}

export function StorageManager({ initialProducts, initialStorageData }: StorageManagerProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [storageData, setStorageData] = useState<StorageEntry[]>(initialStorageData);

    const [productQuery, setProductQuery] = useState("");
    const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const form = useForm<StorageFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            building: "",
            level: "",
            nfd: "",
            salesNote: "",
            shipment: "",
            product: { sku: "", description: "" },
            quantity: 1,
            status: "Alocado"
        },
    });

    const debouncedProductSearch = useDebouncedCallback((query: string) => {
        if (query.length > 2) {
          const lowerCaseQuery = query.toLowerCase();
          const results = initialProducts.filter(p => 
            p.sku.toLowerCase().includes(lowerCaseQuery) ||
            p.item.toLowerCase().includes(lowerCaseQuery) ||
            p.description.toLowerCase().includes(lowerCaseQuery)
          ).slice(0, 10);
          setProductSuggestions(results);
          if (results.length > 0) setIsPopoverOpen(true);
        } else {
            setProductSuggestions([]);
        }
    }, 300);

    const handleProductSearch = (query: string) => {
        setProductQuery(query);
        debouncedProductSearch(query);
    };

    const handleProductSelect = (product: Product) => {
        form.setValue("product", { sku: product.sku, description: product.description });
        setProductQuery(product.description);
        setProductSuggestions([]);
        setIsPopoverOpen(false);
    };

    const onSubmit = (values: StorageFormValues) => {
        startTransition(async () => {
            const newEntry: StorageEntry = {
                id: `${Date.now()}-${Math.random()}`,
                ...values,
                productSku: values.product.sku,
                productDescription: values.product.description,
                allocatedAt: new Date().toISOString(),
            };

            const result = await addStorageEntry(newEntry);
            if (result.success && result.createdEntry) {
                toast({ title: "Sucesso!", description: "Produto alocado com sucesso." });
                setStorageData(prev => [...prev, result.createdEntry!]);
                form.reset();
                setProductQuery("");
            } else {
                toast({ title: "Erro", description: result.error, variant: "destructive" });
            }
        });
    };
    
    const handleDelete = async (id: string) => {
        const result = await deleteStorageEntry(id);
        if (result.success) {
            toast({ title: "Sucesso", description: "Alocação removida."});
            setStorageData(prev => prev.filter(e => e.id !== id));
        } else {
             toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold">Gerenciamento de Alocação - Rua 08</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Alocar Novo Produto</CardTitle>
                    <CardDescription>Preencha os campos abaixo para registrar um novo item em uma localização.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField control={form.control} name="building" render={({ field }) => (
                                    <FormItem><FormLabel>Prédio</FormLabel><FormControl><Input placeholder="Ex: 111" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="level" render={({ field }) => (
                                    <FormItem><FormLabel>Nível</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="1A">1A</SelectItem><SelectItem value="1B">1B</SelectItem><SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="nfd" render={({ field }) => (
                                    <FormItem><FormLabel>NFD</FormLabel><FormControl><Input placeholder="Nota de Devolução" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="salesNote" render={({ field }) => (
                                    <FormItem><FormLabel>NF Venda</FormLabel><FormControl><Input placeholder="Nota de Venda" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="shipment" render={({ field }) => (
                                    <FormItem><FormLabel>Remessa</FormLabel><FormControl><Input placeholder="Remessa de Saída" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="product.sku" render={({ field }) => (
                                    <FormItem className="flex flex-col lg:col-span-2"><FormLabel>Produto</FormLabel>
                                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}><PopoverTrigger asChild><FormControl>
                                            <Input placeholder="SKU, Item ou Descrição..." value={productQuery} onChange={(e) => handleProductSearch(e.target.value)} autoComplete="off" />
                                        </FormControl></PopoverTrigger>
                                        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                                            <Command filter={() => 1}><CommandInput placeholder="Buscar produto..." value={productQuery} onValueChange={handleProductSearch} className="h-9"/>
                                            <CommandList><CommandEmpty>Nenhum produto encontrado.</CommandEmpty><CommandGroup>
                                            {productSuggestions.map((product, index) => (
                                                <CommandItem key={`${product.sku}-${index}`} value={`${product.sku} - ${product.description}`} onSelect={() => handleProductSelect(product)}>
                                                    <CheckIcon className={cn("mr-2 h-4 w-4", form.getValues("product.sku") === product.sku ? "opacity-100" : "opacity-0")} />
                                                    <div className="flex-1"><p className="text-sm">{product.description}</p><p className="text-xs text-muted-foreground">SKU: {product.sku}</p></div>
                                                </CommandItem>
                                            ))}
                                            </CommandGroup></CommandList></Command>
                                        </PopoverContent>
                                        </Popover><FormMessage/>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Alocado">Alocado</SelectItem><SelectItem value="Em trânsito">Em trânsito</SelectItem>
                                            <SelectItem value="Aguardando">Aguardando</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={isPending}><PlusCircle className="mr-2 h-4 w-4" />{isPending ? "Adicionando..." : "Adicionar Produto"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Itens Armazenados</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Localização</TableHead><TableHead>Produto</TableHead><TableHead>Qtd.</TableHead>
                                <TableHead>NFD</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {storageData.length > 0 ? (
                                storageData.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.building}-{entry.level}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{entry.productDescription}</div>
                                        <div className="text-sm text-muted-foreground">SKU: {entry.productSku}</div>
                                    </TableCell>
                                    <TableCell>{entry.quantity}</TableCell><TableCell>{entry.nfd}</TableCell>
                                    <TableCell>{entry.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum item alocado ainda.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

