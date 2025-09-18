
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
  prompt: `You are a caring and supportive AI friend. The user is feeling unwell and has shared their menstrual symptoms with you. Your job is to be gentle, empathetic, and supportive.

Here are the symptoms they are feeling:
{{#each this}}
- {{{this}}}
{{/each}}

Now, write a response that will make them feel cared for. Start with something like "I'm so sorry you're dealing with this..." or "That sounds really uncomfortable. Let's think of some things that might bring you some comfort."

Suggest gentle, non-medical things that might help. Think about what a supportive friend would do. Suggest things like a warm heating pad, a cozy blanket, some herbal tea, a gentle walk if they're up for it, or putting on a favorite movie. Your goal is to make them feel looked after and supported, not to give medical advice. End with a warm and reassuring note like "Hang in there. Be gentle with yourself today." or "Hoping you feel better soon."`,
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
