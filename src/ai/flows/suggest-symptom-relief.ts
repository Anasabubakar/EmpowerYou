
'use server';
/**
 * @fileOverview A flow for suggesting relief for menstrual symptoms.
 *
 * - suggestSymptomRelief - A function that provides helpful, non-medical suggestions for symptom relief.
 * - SuggestSymptomReliefInput - The input type for the suggestSymptomRelief function.
 * - SuggestSymptomReliefOutput - The return type for the suggestSymptomRelief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSymptomReliefInputSchema = z.array(z.string());
export type SuggestSymptomReliefInput = z.infer<typeof SuggestSymptomReliefInputSchema>;

const SuggestSymptomReliefOutputSchema = z.object({
  suggestions: z.string().describe('A paragraph of helpful, non-medical suggestions for the given symptoms.'),
});
export type SuggestSymptomReliefOutput = z.infer<typeof SuggestSymptomReliefOutputSchema>;

export async function suggestSymptomRelief(input: SuggestSymptomReliefInput): Promise<SuggestSymptomReliefOutput> {
  return suggestSymptomReliefFlow(input);
}

const symptomReliefPrompt = ai.definePrompt({
  name: 'symptomReliefPrompt',
  input: {schema: SuggestSymptomReliefInputSchema},
  output: {schema: SuggestSymptomReliefOutputSchema},
  prompt: `You are a caring and knowledgeable wellness assistant. Based on the following menstrual symptoms, provide a few gentle, practical, and non-medical suggestions for relief. Frame your response as helpful advice, not a medical prescription.

Symptoms:
{{#each this}}
- {{{this}}}
{{/each}}

Suggestions should focus on comfort, like gentle exercise, dietary adjustments, or relaxation techniques. Do not suggest any medication.
`,
});

const suggestSymptomReliefFlow = ai.defineFlow(
  {
    name: 'suggestSymptomReliefFlow',
    inputSchema: SuggestSymptomReliefInputSchema,
    outputSchema: SuggestSymptomReliefOutputSchema,
  },
  async (symptoms) => {
    const {output} = await symptomReliefPrompt(symptoms);
    return output!;
  }
);
