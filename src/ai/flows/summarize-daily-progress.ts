
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
import {withRetry} from '@/lib/retry';

const SummarizeDailyProgressInputSchema = z.object({
  dailyRemark: z.string().describe('A brief remark about the day.'),
  diaryEntry: z.string().describe('A detailed diary entry for the day.'),
  gratitude: z.string().describe('A gratitude note for the day.'),
  challenge: z.string().describe('A challenge or hard moment from the day.'),
  tomorrowFocus: z.string().describe('A focus or intention for tomorrow.'),
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
  return withRetry(() => summarizeDailyProgressFlow(input));
}

const summarizeDailyProgressPrompt = ai.definePrompt({
  name: 'summarizeDailyProgressPrompt',
  input: {schema: SummarizeDailyProgressInputSchema},
  output: {schema: SummarizeDailyProgressOutputSchema},
  prompt: `You are a wise and supportive friend, reading a diary entry. Your goal is to provide a warm, insightful summary that makes the user feel heard and understood.

Here's what they shared about their day:

Daily Remark: {{{dailyRemark}}}
Diary Entry: {{{diaryEntry}}}
Wants & Needs Progress: {{{wantsNeedsProgress}}}
Mood: {{{mood}}}
Energy Levels: {{{energyLevels}}}
Partner Reflection: {{{partnerReflection}}}
Gratitude: {{{gratitude}}}
Challenge: {{{challenge}}}
Tomorrow Focus: {{{tomorrowFocus}}}

Now, write a caring and encouraging summary. Address them warmly and respectfully. Use "you" and "your" to speak directly to them.

Reflect on their day, their feelings, and their progress. Acknowledge their efforts, no matter how small. If they had a tough day, offer comfort and validation ("It's completely understandable that you felt that way."). If they had a great day, celebrate with them ("That's so wonderful to hear!"). Provide gentle, constructive insights that show you're paying attention and you care about their happiness and well-being. Make them feel seen and supported.`,
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
