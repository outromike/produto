
"use client";

import { useState, useTransition } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductFormDialog } from './product-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2, Loader2, Settings, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct, findProducts } from '@/app/dashboard/products/management/actions';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Input } from '../ui/input';
import { useDebouncedCallback } from 'use-debounce';

export function ProductManagementClient() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleSearch = useDebouncedCallback((query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    startSearchTransition(async () => {
      const results = await findProducts(query);
      setSearchResults(results);
    });
  }, 300);

  const handleOpenDialog = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleOpenDeleteAlert = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteAlertOpen(true);
  };

  const handleProductSaved = (savedProduct: Product) => {
    // Atualiza o resultado da busca se o produto editado estiver nela
    setSearchResults(prev => prev.map(p => (p.sku === savedProduct.sku ? savedProduct : p)));
    // Não adicionamos à lista, pois o usuário pode criar um produto que não corresponde à busca atual.
    // Uma nova busca trará o produto se ele corresponder.
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    startDeleteTransition(async () => {
        const result = await deleteProduct(selectedProduct.sku);
        if (result.success) {
        toast({ title: "Sucesso!", description: "Produto excluído com sucesso." });
        setSearchResults(searchResults.filter(p => p.sku !== selectedProduct.sku));
        } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
        setIsDeleteAlertOpen(false);
        setSelectedProduct(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-headline font-bold">Gerenciamento de Produtos</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova produtos da base de dados.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Buscar Produto para Editar ou Excluir</h3>
        </div>
        <Input
          placeholder="Digite o SKU ou parte da descrição do produto..."
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isSearching ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                </TableRow>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell className="font-mono">{product.sku}</TableCell>
                  <TableCell className="font-medium hover:text-primary"><Link href={`/dashboard/products/${product.sku}`}>{product.description}</Link></TableCell>
                  <TableCell><Badge variant="outline">{product.unit}</Badge></TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteAlert(product)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum produto encontrado. Digite na busca para começar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        product={selectedProduct}
        onProductSaved={handleProductSaved}
      />
      
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto:
              <br />
              <span className="font-bold">{selectedProduct?.sku} - {selectedProduct?.description}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
