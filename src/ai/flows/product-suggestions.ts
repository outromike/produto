// src/ai/flows/product-suggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-driven product suggestions.
 *
 * - `getProductSuggestions`: A function that takes a product description and returns suggestions for alternative or similar products.
 * - `ProductSuggestionsInput`: The input type for the `getProductSuggestions` function.
 * - `ProductSuggestionsOutput`: The output type for the `getProductSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Product } from '@/types';

const ProductSuggestionsInputSchema = z.object({
  productDescription: z
    .string()
    .describe('A descrição do produto para o qual as sugestões são necessárias.'),
  productCategory: z
    .string()
    .describe('A categoria do produto para o qual as sugestões são necessárias.'),
  productUnit: z
    .string()
    .describe('A unidade (ITJ ou JVL) do produto para a qual as sugestões são necessárias.'),
  allProducts: z.array(z.any()).describe('A lista completa de todos os produtos para a IA pesquisar.'),
});
export type ProductSuggestionsInput = z.infer<typeof ProductSuggestionsInputSchema>;

const SuggestionSchema = z.object({
  sku: z.string().describe('O SKU do produto sugerido.'),
  description: z.string().describe('A descrição do produto sugerido.'),
});

const ProductSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .describe(
      'Uma lista de produtos alternativos ou similares sugeridos, incluindo SKU e descrição.'
    ),
  alternativeSearchOptions: z
    .string()
    .describe(
      'Se nenhuma sugestão puder ser encontrada, este campo fornece opções de pesquisa alternativas para o usuário.'
    ),
});
export type ProductSuggestionsOutput = z.infer<typeof ProductSuggestionsOutputSchema>;

export async function getProductSuggestions(input: ProductSuggestionsInput): Promise<ProductSuggestionsOutput> {
  return productSuggestionsFlow(input);
}

const productSuggestionsPrompt = ai.definePrompt({
  name: 'productSuggestionsPrompt',
  input: {schema: ProductSuggestionsInputSchema},
  output: {schema: ProductSuggestionsOutputSchema},
  prompt: `Você é um assistente de IA que ajuda os usuários a encontrar produtos alternativos ou similares com base no produto que eles estão visualizando no momento.

  A seguir está a lista completa de todos os produtos disponíveis no inventário:
  {{#each allProducts}}
  - SKU: {{sku}}, Descrição: {{description}}, Categoria: {{category}}, Unidade: {{unit}}
  {{/each}}

  Forneça uma lista de 3 a 5 sugestões de produtos alternativos da lista acima com base nos seguintes atributos do produto que o usuário está visualizando:

  Descrição do Produto: {{{productDescription}}}
  Categoria do Produto: {{{productCategory}}}
  Unidade do Produto: {{{productUnit}}}

  Para cada sugestão, forneça o SKU e a descrição exatos do produto como aparecem na lista de inventário.
  Se você não conseguir encontrar nenhuma sugestão relevante com base nas informações disponíveis, retorne uma lista vazia para sugestões e ofereça opções de pesquisa alternativas no campo alternativeSearchOptions.
`,
});

const productSuggestionsFlow = ai.defineFlow(
  {
    name: 'productSuggestionsFlow',
    inputSchema: ProductSuggestionsInputSchema,
    outputSchema: ProductSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await productSuggestionsPrompt(input);
    return output!;
  }
);
