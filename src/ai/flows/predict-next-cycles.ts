
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
  prompt: `You are a helpful AI assistant. The user is asking for a prediction for their next menstrual cycles.

Their last period started on {{{lastPeriodDate}}}. Based on this, predict the start dates for their next three cycles. Assume a standard 28-day cycle.

Your response should be formatted for the 'predictedDates' array. The dates must be in a readable string format like "MMMM d, yyyy". Frame the response as a helpful estimate for planning.
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
