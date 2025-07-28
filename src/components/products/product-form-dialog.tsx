
"use client";

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types';
import { addProduct, updateProduct } from '@/app/dashboard/products/management/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface ProductFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product: Product | null;
  onProductSaved: (product: Product) => void;
}

const formSchema = z.object({
  sku: z.string().min(1, 'SKU é obrigatório.'),
  item: z.string().min(1, 'Item é obrigatório.'),
  description: z.string().min(1, 'Descrição é obrigatória.'),
  category: z.string().min(1, 'Categoria é obrigatória.'),
  netWeight: z.coerce.number().min(0, 'Peso líquido deve ser positivo.'),
  grossWeight: z.coerce.number().min(0, 'Peso bruto deve ser positivo.'),
  volume: z.coerce.number().min(0, 'Volume deve ser positivo.'),
  height: z.coerce.number().min(0, 'Altura deve ser positiva.'),
  width: z.coerce.number().min(0, 'Largura deve ser positiva.'),
  length: z.coerce.number().min(0, 'Comprimento deve ser positivo.'),
  palletHeight: z.coerce.number().int().min(0, 'Paletização (Altura) deve ser um inteiro positivo.'),
  palletBase: z.coerce.number().int().min(0, 'Paletização (Base) deve ser um inteiro positivo.'),
  barcode: z.string().min(1, 'Código de barras é obrigatório.'),
  packaging: z.string().min(1, 'Embalagem é obrigatória.'),
  measurementUnit: z.string().min(1, 'Unidade de medida é obrigatória.'),
  quantity: z.coerce.number().int().min(0, 'Quantidade deve ser um inteiro positivo.'),
  classification: z.enum(['A', 'B', 'C']),
  unit: z.enum(['ITJ', 'JVL']),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductFormDialog({ isOpen, setIsOpen, product, onProductSaved }: ProductFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isEditMode = !!product;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        sku: '', item: '', description: '', category: '', netWeight: 0, grossWeight: 0,
        volume: 0, height: 0, width: 0, length: 0, palletHeight: 0, palletBase: 0,
        barcode: '', packaging: '', measurementUnit: '', quantity: 0,
        classification: 'A', unit: 'ITJ'
    }
  });

  useEffect(() => {
    if (isOpen && product) {
        const [height, width, length] = product.dimensions.split('x').map(Number);
      form.reset({
        sku: product.sku,
        item: product.item,
        description: product.description,
        category: product.category,
        netWeight: product.netWeight,
        grossWeight: product.grossWeight,
        volume: product.volume,
        height, width, length,
        palletHeight: product.palletization.height,
        palletBase: product.palletization.base,
        barcode: product.barcode,
        packaging: product.packaging,
        measurementUnit: product.measurementUnit,
        quantity: product.quantity,
        classification: product.classification as 'A' | 'B' | 'C',
        unit: product.unit,
      });
    } else if (isOpen) {
      form.reset({
        sku: '', item: '', description: '', category: '', netWeight: 0, grossWeight: 0,
        volume: 0, height: 0, width: 0, length: 0, palletHeight: 0, palletBase: 0,
        barcode: '', packaging: '', measurementUnit: '', quantity: 0,
        classification: 'A', unit: 'ITJ'
      });
    }
  }, [isOpen, product, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
        const productData: Product = {
            sku: values.sku,
            item: values.item,
            description: values.description,
            category: values.category,
            netWeight: values.netWeight,
            grossWeight: values.grossWeight,
            volume: values.volume,
            dimensions: `${values.height}x${values.width}x${values.length}`,
            palletization: {
                height: values.palletHeight,
                base: values.palletBase,
            },
            barcode: values.barcode,
            packaging: values.packaging,
            measurementUnit: values.measurementUnit,
            quantity: values.quantity,
            classification: values.classification,
            unit: values.unit,
        };

        const result = isEditMode
            ? await updateProduct(product.sku, productData)
            : await addProduct(productData);
        
        if (result.success) {
            toast({ title: "Sucesso!", description: `Produto ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.` });
            onProductSaved(productData);
            setIsOpen(false);
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? `Alterando dados para ${product?.sku}.` : 'Preencha todos os campos para criar um novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
            <div className="pr-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="sku" render={({ field }) => (
                        <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="item" render={({ field }) => (
                        <FormItem><FormLabel>Item</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="lg:col-span-3"><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem className="lg:col-span-3"><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="netWeight" render={({ field }) => (
                        <FormItem><FormLabel>Peso Líquido</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="grossWeight" render={({ field }) => (
                        <FormItem><FormLabel>Peso Bruto</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="volume" render={({ field }) => (
                        <FormItem><FormLabel>Volume (m³)</FormLabel><FormControl><Input type="number" step="0.000001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem><FormLabel>Altura</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="width" render={({ field }) => (
                        <FormItem><FormLabel>Largura</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="length" render={({ field }) => (
                        <FormItem><FormLabel>Comprimento</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="palletHeight" render={({ field }) => (
                        <FormItem><FormLabel>Paletização (Altura)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="palletBase" render={({ field }) => (
                        <FormItem><FormLabel>Paletização (Base)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="barcode" render={({ field }) => (
                        <FormItem><FormLabel>Código de Barras</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="packaging" render={({ field }) => (
                        <FormItem><FormLabel>Embalagem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="measurementUnit" render={({ field }) => (
                        <FormItem><FormLabel>Unidade de Medida</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="classification" render={({ field }) => (
                        <FormItem><FormLabel>Classe ABC</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Unidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="ITJ">ITJ</SelectItem><SelectItem value="JVL">JVL</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                </div>
                 <DialogFooter className="pt-4 pr-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isEditMode ? 'Salvar Alterações' : 'Criar Produto'}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
