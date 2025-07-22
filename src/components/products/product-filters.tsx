"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';

interface ProductFiltersProps {
    categories: string[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange('query', term);
  }, 300);
  
  const clearFilters = () => {
    replace(pathname);
  };

  return (
    <div className="flex flex-col gap-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm sticky top-20">
      <h3 className="text-lg font-headline font-semibold">Filtros</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="search">Busca</Label>
          <Input
            id="search"
            placeholder="SKU, descrição, categoria..."
            defaultValue={searchParams.get('query')?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div>
            <Label htmlFor="category">Categoria</Label>
            <Select onValueChange={(value) => handleFilterChange('category', value)} defaultValue={searchParams.get('category') || 'all'}>
                <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div>
            <Label htmlFor="unit">Unidade</Label>
            <Select onValueChange={(value) => handleFilterChange('unit', value)} defaultValue={searchParams.get('unit') || 'all'}>
                <SelectTrigger id="unit">
                    <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Unidades</SelectItem>
                    <SelectItem value="ITJ">Itajaí (ITJ)</SelectItem>
                    <SelectItem value="JVL">Joinville (JVL)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div>
            <Label htmlFor="classification">Classe ABC</Label>
            <Select onValueChange={(value) => handleFilterChange('classification', value)} defaultValue={searchParams.get('classification') || 'all'}>
                <SelectTrigger id="classification">
                    <SelectValue placeholder="Selecione uma classe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Classes</SelectItem>
                    <SelectItem value="A">Classe A</SelectItem>
                    <SelectItem value="B">Classe B</SelectItem>
                    <SelectItem value="C">Classe C</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div>
            <Label htmlFor="packaging">Embalagem</Label>
            <Select onValueChange={(value) => handleFilterChange('packaging', value)} defaultValue={searchParams.get('packaging') || 'all'}>
                <SelectTrigger id="packaging">
                    <SelectValue placeholder="Selecione um tipo de embalagem" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="UNIDADE">Unidade</SelectItem>
                    <SelectItem value="MASTER">Master</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button variant="ghost" onClick={clearFilters} className="w-full">Limpar Todos os Filtros</Button>
      </div>
    </div>
  );
}
