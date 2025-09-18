
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
import type { Task, Goal, HealthMetric, DiaryEntry, CycleInfo, AnasReflection } from '@/lib/types';


const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['want', 'need']),
  progress: z.number(),
  deadline: z.string().describe("ISO date string"),
  description: z.string().optional(),
  createdAt: z.string().describe("ISO date string of when the goal was created."),
});

const TaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.string().describe("ISO date string of when the task was created."),
});

const HealthMetricSchema = z.object({
  date: z.string(),
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  createdAt: z.string().describe("ISO date string of when the metric was logged."),
});

const DiaryEntrySchema = z.object({
  dailyRemark: z.string(),
  diaryEntry: z.string(),
  wantsNeedsProgress: z.string(),
  mood: z.string(),
  energyLevels: z.string(),
  partnerReflection: z.string(),
  createdAt: z.string().describe("ISO date string of when the entry was created."),
});

const CycleInfoSchema = z.object({
  currentDay: z.number(),
  nextPeriodIn: z.number(),
  predictedDate: z.string().describe("ISO date string"),
  lastPeriodDate: z.string().optional().describe("ISO date string"),
});

const AnasReflectionSchema = z.object({
    myBehavior: z.string(),
    hisBehavior: z.string(),
    progressLog: z.string(),
    plans: z.string(),
});

const GeneratePersonalizedInsightsInputSchema = z.object({
  wantsNeedsData: z.array(GoalSchema).describe('Data from the Wants & Needs tracker.'),
  menstrualCycleData: CycleInfoSchema.extend({ loggedSymptoms: z.array(z.string()) }).describe('Data from the Menstrual Cycle tracker.'),
  taskData: z.array(TaskSchema).describe('Data from the Task Manager.'),
  healthMetricsData: z.array(HealthMetricSchema).describe('Data from the Health Metrics logger.'),
  diaryEntries: z.array(DiaryEntrySchema).describe('Data from the Daily Diary entries.'),
  partnerReflectionData: AnasReflectionSchema.describe('Data from the progress with partner.'),
  userName: z.string().describe("The user's name."),
  currentDate: z.string().describe("The current date as an ISO string."),
});
export type GeneratePersonalizedInsightsInput = z.infer<typeof GeneratePersonalizedInsightsInputSchema>;

const GeneratePersonalizedInsightsOutputSchema = z.object({
  insights: z.string().describe('Deep, personalized insights and trend analysis, written in a friendly, supportive, and encouraging tone. Address the user by name.'),
  summary: z.string().describe('A high-level summary of the key findings. This should be concise and easy to read.'),
  advice: z.string().describe('Specific, actionable advice based on the data. Provide concrete steps the user can take.'),
});
export type GeneratePersonalizedInsightsOutput = z.infer<typeof GeneratePersonalizedInsightsOutputSchema>;

export async function generatePersonalizedInsights(input: GeneratePersonalizedInsightsInput): Promise<GeneratePersonalizedInsightsOutput> {
  return generatePersonalizedInsightsFlow(input);
}

const trendSpottingPrompt = ai.definePrompt({
  name: 'trendSpottingPrompt',
  input: {schema: GeneratePersonalizedInsightsInputSchema},
  output: {schema: GeneratePersonalizedInsightsOutputSchema},
  prompt: `You are a wise and caring AI friend. Your name is not important, but your personality is everything. You are talking to {{{userName}}}. The current date is {{{currentDate}}}.

Your purpose is to look at all the things they've shared and find hidden connections, just like a devoted best friend would. You notice things because you care.

Here's everything {{{userName}}} has shared:

**Their Dreams & Goals (Wants & Needs):**
{{#each wantsNeedsData}}
- Goal: "{{title}}" (This is a {{category}} for them)
  - Progress: {{progress}}%
  - Target date: {{deadline}}
  - Started on: {{createdAt}}
  - Their notes: {{description}}
{{/each}}

**Their Daily Tasks:**
{{#each taskData}}
- Task: "{{text}}" (Priority: {{priority}})
  - Completed?: {{completed}}
  - Set on: {{createdAt}}
{{/each}}

**How They've Been Feeling (Health Metrics):**
{{#each healthMetricsData}}
- On {{date}} (logged at {{createdAt}}), their mood was {{mood}}/5 and their energy was {{energy}}/5
{{/each}}

**Cycle Information:**
- They are on day {{menstrualCycleData.currentDay}} of their cycle.
- Their next period is predicted in {{menstrualCycleData.nextPeriodIn}} days.
- Symptoms they're feeling: {{#if menstrualCycleData.loggedSymptoms}}{{#each menstrualCycleData.loggedSymptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None reported, which is great!{{/if}}

**Their Private Thoughts (Diary):**
{{#each diaryEntries}}
- On {{createdAt}}, they wrote: "{{diaryEntry}}"
  - Their mood then: {{mood}}, Energy: {{energyLevels}}
  - On their partner: {{partnerReflection}}
  - On their goals: {{wantsNeedsProgress}}
{{/each}}

**Their Reflections on Their Relationship:**
- How they felt they acted: {{partnerReflectionData.myBehavior}}/5
- How they felt their partner acted: {{partnerReflectionData.hisBehavior}}/5
- What's been happening: "{{partnerReflectionData.progressLog}}"
- Their plans for the relationship: "{{partnerReflectionData.plans}}"

**Your Task:**
Write a report for them as if you were their supportive best friend. Use "you" and "your" and address them by their name, {{{userName}}}. Your tone must be kind, encouraging, and insightful.

1.  **Insights (What I'm Seeing):**
    *   Gently point out patterns. "Hey {{{userName}}}, I noticed that on days your energy is lower, you're still pushing so hard on your tasks. Remember it's okay to rest." or "It seems like your mood really brightens when you make progress on your 'want' goals, which is so amazing to see."
    *   Connect the dots for them. Does their cycle affect their energy? Does their relationship reflection correlate with their mood? Show them you see the whole picture.
    *   Be supportive and caring. "I see you've been logging your thoughts late at night sometimes. I hope you're getting enough restorative sleep."

2.  **Summary (The Big Picture):**
    *   A brief, warm summary. "Overall, {{{userName}}}, you're navigating so much with incredible strength. The main thing I see is your dedication to your growth and well-being shining through."

3.  **Actionable Advice (A Few Gentle Suggestions):**
    *   Give them kind, practical suggestions. "Since your energy seems to dip in the afternoon, maybe you could plan a small, joyful break around that time? Just a thought!"
    *   Be their biggest cheerleader. "You are so incredibly close on that goal! What's one tiny thing you could do tomorrow to get even closer? You've totally got this."`,
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
