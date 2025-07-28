
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConferenceEntry, StorageLocation, StorageEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { allocateProducts } from "@/app/dashboard/rua08/actions";
import { findProduct } from "@/app/dashboard/receiving/actions";

// Simplified form for now, will be expanded upon
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Trash2, CheckIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";

interface AllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationId: string;
    locationData: StorageLocation | undefined;
    allConferences: ConferenceEntry[];
    onAllocationUpdate: (location: StorageLocation) => void;
}

export function AllocationModal({ 
    isOpen, 
    onClose, 
    locationId, 
    locationData, 
    allConferences, 
    onAllocationUpdate 
}: AllocationModalProps) {
    
    const [isPending, setIsPending] = useState(false);
    const { toast } = useToast();
    const [entries, setEntries] = useState<StorageEntry[]>([]);
    
    const [productQuery, setProductQuery] = useState("");
    const [suggestions, setSuggestions] = useState<ConferenceEntry[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
        if(locationData) {
            setEntries(locationData.entries);
        } else {
            setEntries([]);
        }
    }, [locationData]);

    const handleProductSearch = (query: string) => {
        setProductQuery(query);
        if (query.length > 2) {
            const filtered = allConferences.filter(c => 
                c.nfd.toLowerCase().includes(query.toLowerCase()) || 
                c.productDescription.toLowerCase().includes(query.toLowerCase()) ||
                c.productSku.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            if(filtered.length > 0) setIsPopoverOpen(true);
        } else {
            setSuggestions([]);
        }
    }

    const handleProductSelect = (conference: ConferenceEntry) => {
        const newEntry: StorageEntry = {
            nfd: conference.nfd,
            productSku: conference.productSku,
            productDescription: conference.productDescription,
            quantity: conference.receivedVolume, // Default to full amount
            timestamp: new Date().toISOString()
        };
        setEntries(prev => [...prev, newEntry]);
        setIsPopoverOpen(false);
        setProductQuery("");
        setSuggestions([]);
    }

    const handleQuantityChange = (index: number, newQuantity: number) => {
        const updatedEntries = [...entries];
        updatedEntries[index].quantity = newQuantity;
        setEntries(updatedEntries);
    }
    
    const handleRemoveEntry = (index: number) => {
        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);
    }

    const handleSave = async () => {
        setIsPending(true);
        const result = await allocateProducts(locationId, entries);
        if (result.success && result.updatedLocation) {
            toast({ title: "Sucesso!", description: `Localização ${locationId} atualizada.`});
            onAllocationUpdate(result.updatedLocation);
            onClose();
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
        setIsPending(false);
    }
  
  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alocar Produtos em {locationId}</DialogTitle>
            <DialogDescription>
              Adicione produtos a esta localização. Você pode buscar por NFD ou produto de uma conferência finalizada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
                <Label htmlFor="product-search">Buscar NFD / Produto</Label>
                 <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                      <Input
                        id="product-search"
                        placeholder="Digite para buscar..."
                        value={productQuery}
                        onChange={(e) => handleProductSearch(e.target.value)}
                        autoComplete="off"
                      />
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                    <Command filter={() => 1}>
                      <CommandInput
                        placeholder="Buscar..."
                        value={productQuery}
                        onValueChange={handleProductSearch}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                          {suggestions.map((conference, index) => (
                            <CommandItem
                              key={conference.id + '-' + index}
                              value={`${conference.nfd} - ${conference.productSku} - ${conference.productDescription}`}
                              onSelect={() => handleProductSelect(conference)}
                            >
                              <div className="flex-1">
                                <p className="text-sm">{conference.productDescription}</p>
                                <p className="text-xs text-muted-foreground">SKU: {conference.productSku} | NFD: {conference.nfd} | Qtd: {conference.receivedVolume}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            
            <h4 className="font-semibold mt-4 border-b pb-2">Produtos para Alocar</h4>
            <ScrollArea className="h-64">
                <div className="space-y-4 pr-4">
                    {entries.length > 0 ? entries.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{entry.productDescription}</p>
                                <p className="text-xs text-muted-foreground">SKU: {entry.productSku} | NFD: {entry.nfd}</p>
                            </div>
                            <Input 
                                type="number" 
                                value={entry.quantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 0)}
                                className="w-20"
                            />
                             <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveEntry(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto adicionado para esta localização.</p>
                    )}
                </div>
            </ScrollArea>
          </div>
           <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="button" onClick={handleSave} disabled={isPending}>
                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alocação
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}

