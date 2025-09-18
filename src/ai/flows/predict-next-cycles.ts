
'use server';
/**
 * @fileOverview A flow for predicting future menstrual cycle dates.
 *
 * - predictNextCycles - A function that predicts the start dates of the next three cycles.
 * - PredictNextCyclesInput - The input type for the predictNextCycles function.
 * - PredictNextCyclesOutput - The return type for the predictNextCycles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictNextCyclesInputSchema = z.object({
  lastPeriodDate: z.string().describe("The ISO date string of the user's last period start date."),
});
export type PredictNextCyclesInput = z.infer<typeof PredictNextCyclesInputSchema>;

const PredictNextCyclesOutputSchema = z.object({
    predictedDates: z.array(z.string()).describe('An array of strings, each representing the predicted start date of the next three menstrual cycles in a readable format (e.g., "MMMM d, yyyy").'),
});
export type PredictNextCyclesOutput = z.infer<typeof PredictNextCyclesOutputSchema>;

export async function predictNextCycles(input: PredictNextCyclesInput): Promise<PredictNextCyclesOutput> {
  return predictNextCyclesFlow(input);
}

const cyclePredictionPrompt = ai.definePrompt({
  name: 'cyclePredictionPrompt',
  input: {schema: PredictNextCyclesInputSchema},
  output: {schema: PredictNextCyclesOutputSchema},
  prompt: `You are a helpful wellness assistant. Based on the user's last period start date of {{{lastPeriodDate}}}, predict the start dates for their next three menstrual cycles. Assume a standard 28-day cycle length. Format each predicted date as a readable string, like "MMMM d, yyyy".
`,
});

const predictNextCyclesFlow = ai.defineFlow(
  {
    name: 'predictNextCyclesFlow',
    inputSchema: PredictNextCyclesInputSchema,
    outputSchema: PredictNextCyclesOutputSchema,
  },
  async (input) => {
    const {output} = await cyclePredictionPrompt(input);
    return output!;
  }
);
