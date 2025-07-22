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

const ProductSuggestionsInputSchema = z.object({
  productDescription: z
    .string()
    .describe('The description of the product for which suggestions are needed.'),
  productCategory: z
    .string()
    .describe('The category of the product for which suggestions are needed.'),
  productUnit: z
    .string()
    .describe('The unit (ITJ or JVL) of the product for which suggestions are needed.'),
});
export type ProductSuggestionsInput = z.infer<typeof ProductSuggestionsInputSchema>;

const ProductSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A list of suggested alternative or similar products.')
  ).describe('A list of suggested alternative or similar products, or an empty list if no suggestions could be found.'),
  alternativeSearchOptions: z
    .string()
    .describe('If no suggestions could be found, this field provides alternative search options for the user.'),
});
export type ProductSuggestionsOutput = z.infer<typeof ProductSuggestionsOutputSchema>;

export async function getProductSuggestions(input: ProductSuggestionsInput): Promise<ProductSuggestionsOutput> {
  return productSuggestionsFlow(input);
}

const productSuggestionsPrompt = ai.definePrompt({
  name: 'productSuggestionsPrompt',
  input: {schema: ProductSuggestionsInputSchema},
  output: {schema: ProductSuggestionsOutputSchema},
  prompt: `You are an AI assistant helping users find alternative or similar products based on the product they are currently viewing.

  Provide a list of alternative product suggestions based on the following product attributes:

  Product Description: {{{productDescription}}}
  Product Category: {{{productCategory}}}
  Product Unit: {{{productUnit}}}

  If you cannot find any relevant suggestions based on the available information, return an empty list for suggestions and offer alternative search options in the alternativeSearchOptions field.
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
