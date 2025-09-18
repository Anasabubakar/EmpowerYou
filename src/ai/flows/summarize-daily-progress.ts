// SummarizeDailyProgress story implementation.
'use server';

/**
 * @fileOverview A flow for summarizing daily progress and providing insights.
 *
 * - summarizeDailyProgress - A function that handles the summarization of daily progress.
 * - SummarizeDailyProgressInput - The input type for the summarizeDailyProgress function.
 * - SummarizeDailyProgressOutput - The return type for the summarizeDailyProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDailyProgressInputSchema = z.object({
  dailyRemark: z.string().describe('A brief remark about the day.'),
  diaryEntry: z.string().describe('A detailed diary entry for the day.'),
  wantsNeedsProgress: z.string().describe('Progress on wants and needs.'),
  mood: z.string().describe('The mood for the day.'),
  energyLevels: z.string().describe('The energy levels for the day.'),
  partnerReflection: z.string().describe('Reflection on interactions with partner.'),
});
export type SummarizeDailyProgressInput = z.infer<typeof SummarizeDailyProgressInputSchema>;

const SummarizeDailyProgressOutputSchema = z.object({
  summary: z.string().describe('A summary of the day\'s progress and insights.'),
});
export type SummarizeDailyProgressOutput = z.infer<typeof SummarizeDailyProgressOutputSchema>;

export async function summarizeDailyProgress(input: SummarizeDailyProgressInput): Promise<SummarizeDailyProgressOutput> {
  return summarizeDailyProgressFlow(input);
}

const summarizeDailyProgressPrompt = ai.definePrompt({
  name: 'summarizeDailyProgressPrompt',
  input: {schema: SummarizeDailyProgressInputSchema},
  output: {schema: SummarizeDailyProgressOutputSchema},
  prompt: `Summarize the daily progress and provide insights based on the following information:

Daily Remark: {{{dailyRemark}}}
Diary Entry: {{{diaryEntry}}}
Wants & Needs Progress: {{{wantsNeedsProgress}}}
Mood: {{{mood}}}
Energy Levels: {{{energyLevels}}}
Partner Reflection: {{{partnerReflection}}}

Provide a summary of the day's events and offer personalized insights and advice based on the trends and patterns observed in the provided data. Focus on actionable recommendations for personal growth and well-being.`,
});

const summarizeDailyProgressFlow = ai.defineFlow(
  {
    name: 'summarizeDailyProgressFlow',
    inputSchema: SummarizeDailyProgressInputSchema,
    outputSchema: SummarizeDailyProgressOutputSchema,
  },
  async input => {
    const {output} = await summarizeDailyProgressPrompt(input);
    return output!;
  }
);
