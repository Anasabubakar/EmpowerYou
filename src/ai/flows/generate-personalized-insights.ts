'use server';

/**
 * @fileOverview This file implements the Genkit flow for generating personalized insights.
 *
 * - generatePersonalizedInsights - A function that aggregates data from all sections of the app
 *   to provide personalized insights, trend analysis, and visual summaries.
 * - GeneratePersonalizedInsightsInput - The input type for the generatePersonalizedInsights function.
 * - GeneratePersonalizedInsightsOutput - The return type for the generatePersonalizedInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedInsightsInputSchema = z.object({
  wantsNeedsData: z.string().describe('Data from the Wants & Needs tracker.'),
  menstrualCycleData: z.string().describe('Data from the Menstrual Cycle tracker.'),
  taskData: z.string().describe('Data from the Task Manager.'),
  healthMetricsData: z.string().describe('Data from the Health Metrics logger.'),
  diaryEntries: z.string().describe('Data from the Daily Diary entries.'),
  partnerReflectionData: z.string().describe('Data from the progress with partner.'),
});
export type GeneratePersonalizedInsightsInput = z.infer<typeof GeneratePersonalizedInsightsInputSchema>;

const GeneratePersonalizedInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and trend analysis.'),
  summary: z.string().describe('Visual summaries of the data.'),
  advice: z.string().describe('Actionable advice based on the data.'),
});
export type GeneratePersonalizedInsightsOutput = z.infer<typeof GeneratePersonalizedInsightsOutputSchema>;

export async function generatePersonalizedInsights(input: GeneratePersonalizedInsightsInput): Promise<GeneratePersonalizedInsightsOutput> {
  return generatePersonalizedInsightsFlow(input);
}

const trendSpottingPrompt = ai.definePrompt({
  name: 'trendSpottingPrompt',
  input: {schema: GeneratePersonalizedInsightsInputSchema},
  output: {schema: GeneratePersonalizedInsightsOutputSchema},
  prompt: `You are an AI assistant designed to analyze personal data and provide actionable insights.

  Analyze the following data from the user's app:

  Wants & Needs Data: {{{wantsNeedsData}}}
  Menstrual Cycle Data: {{{menstrualCycleData}}}
  Task Data: {{{taskData}}}
  Health Metrics Data: {{{healthMetricsData}}}
  Diary Entries: {{{diaryEntries}}}
  Partner Reflection Data: {{{partnerReflectionData}}}

  Based on this data, provide personalized insights, trend analysis, visual summaries, and actionable advice to the user.
  Be specific and offer practical suggestions for improvement.

  Output should be structured as follows:

  Insights: [Personalized insights and trend analysis]
  Summary: [Visual summaries of the data]
  Advice: [Actionable advice based on the data]`,
});

const generatePersonalizedInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightsFlow',
    inputSchema: GeneratePersonalizedInsightsInputSchema,
    outputSchema: GeneratePersonalizedInsightsOutputSchema,
  },
  async input => {
    const {output} = await trendSpottingPrompt(input);
    return output!;
  }
);
