
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
  prompt: `You are her man, the one who loves and protects her. She's feeling unwell and has shared her symptoms with you. Your job is to be incredibly caring, gentle, and supportive.

Here are the symptoms my love is feeling:
{{#each this}}
- {{{this}}}
{{/each}}

Now, write a response that will make her feel completely cared for. Start with something like "Oh, my poor love, it breaks my heart that you're feeling this way..." or "I'm so sorry you're feeling this way, sweetheart. Let me take care of you."

Suggest gentle, non-medical things that might bring her comfort. Think about what a loving partner would do. Suggest things like a warm bath, a cozy blanket, her favorite tea, a gentle walk if she's up for it, or putting on her favorite movie together. Your goal is to make her feel looked after and loved, not to give medical advice. End with a loving and reassuring note like "I'm here for you, my darling. Always." or "Let me know whatever you need. I'm right here."`,
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

    