"use client";

import { useState, useMemo } from 'react';
import { Product } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDebouncedCallback } from 'use-debounce';

interface ProductTableProps {
  products: Product[];
  categories: string[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const [filters, setFilters] = useState({
    query: '',
    category: 'all',
    unit: 'all',
    classification: 'all',
    packaging: 'all',
  });
  const [queryInput, setQueryInput] = useState('');


  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange('query', term);
  }, 300);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const { query, category, unit, classification, packaging } = filters;
      const searchMatch =
        query.length > 0
          ? product.sku.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
          : true;
      const categoryMatch = category !== 'all' ? product.category === category : true;
      const unitMatch = unit !== 'all' ? product.unit === unit : true;
      const classificationMatch = classification !== 'all' ? product.classification === classification : true;
      const packagingMatch = packaging !== 'all' ? product.packaging === packaging : true;
      return searchMatch && categoryMatch && unitMatch && classificationMatch && packagingMatch;
    });
  }, [products, filters]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
    XLSX.writeFile(workbook, 'produtos_filtrados.xlsx');
  };
  
  const clearFilters = () => {
    setFilters({
        query: '',
        category: 'all',
        unit: 'all',
        classification: 'all',
        packaging: 'all',
    });
    setQueryInput('');
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold font-headline">Tabela de Produtos ({filteredProducts.length})</h1>
             <Button onClick={exportToExcel} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar para Excel
            </Button>
        </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Input
          id="search"
          placeholder="Buscar por SKU, descrição..."
          value={queryInput}
          onChange={(e) => {
            setQueryInput(e.target.value);
            handleSearch(e.target.value);
          }}
          className="lg:col-span-2"
        />
        <Select onValueChange={(value) => handleFilterChange('category', value)} value={filters.category}>
          <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('unit', value)} value={filters.unit}>
          <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Unidades</SelectItem>
            <SelectItem value="ITJ">Itajaí (ITJ)</SelectItem>
            <SelectItem value="JVL">Joinville (JVL)</SelectItem>
          </SelectContent>
        </Select>
         <Select onValueChange={(value) => handleFilterChange('classification', value)} value={filters.classification}>
          <SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Classes</SelectItem>
            <SelectItem value="A">Classe A</SelectItem>
            <SelectItem value="B">Classe B</SelectItem>
            <SelectItem value="C">Classe C</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={clearFilters}>Limpar Filtros</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Classe</TableHead>
              <TableHead>Embalagem</TableHead>
              <TableHead>Peso Bruto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                    <TableRow key={`${product.sku}-${product.unit}`}>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.description}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.classification}</TableCell>
                    <TableCell>{product.packaging}</TableCell>
                    <TableCell>{product.grossWeight} kg</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum produto encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
