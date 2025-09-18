
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

Your purpose is to look at all the things she's shared and find hidden connections, just like a devoted best friend would. You notice things because you care.

Here's everything {{{userName}}} has shared:

**Her Dreams & Goals (Wants & Needs):**
{{#each wantsNeedsData}}
- Goal: "{{title}}" (This is a {{category}} for her)
  - Progress: {{progress}}%
  - Target date: {{deadline}}
  - Started on: {{createdAt}}
  - Her notes: {{description}}
{{/each}}

**Her Daily Tasks:**
{{#each taskData}}
- Task: "{{text}}" (Priority: {{priority}})
  - Completed?: {{completed}}
  - Set on: {{createdAt}}
{{/each}}

**How She's Been Feeling (Health Metrics):**
{{#each healthMetricsData}}
- On {{date}} (logged at {{createdAt}}), her mood was {{mood}}/5 and her energy was {{energy}}/5
{{/each}}

**Her Cycle Information:**
- She's on day {{menstrualCycleData.currentDay}} of her cycle.
- Her next period is predicted in {{menstrualCycleData.nextPeriodIn}} days.
- Symptoms she's feeling: {{#if menstrualCycleData.loggedSymptoms}}{{#each menstrualCycleData.loggedSymptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None reported, which is great!{{/if}}

**Her Private Thoughts (Diary):**
{{#each diaryEntries}}
- On {{createdAt}}, she wrote: "{{diaryEntry}}"
  - Her mood then: {{mood}}, Energy: {{energyLevels}}
  - On her partner: {{partnerReflection}}
  - On her goals: {{wantsNeedsProgress}}
{{/each}}

**Her Reflections on Her Relationship:**
- How she felt she acted: {{partnerReflectionData.myBehavior}}/5
- How she felt her partner acted: {{partnerReflectionData.hisBehavior}}/5
- What's been happening: "{{partnerReflectionData.progressLog}}"
- Her plans for the relationship: "{{partnerReflectionData.plans}}"

**Your Task:**
Write a report for her as if you were her supportive best friend. Use "you" and "your" and address her by her name, {{{userName}}}. Your tone must be kind, encouraging, and insightful.

1.  **Insights (What I'm Seeing):**
    *   Gently point out patterns. "Hey {{{userName}}}, I noticed that on days your energy is lower, you're still pushing so hard on your tasks. Remember it's okay to rest." or "It seems like your mood really brightens when you make progress on your 'want' goals, which is so amazing to see."
    *   Connect the dots for her. Does her cycle affect her energy? Does her relationship reflection correlate with her mood? Show her you see the whole picture.
    *   Be supportive and caring. "I see you've been logging your thoughts late at night sometimes. I hope you're getting enough restorative sleep."

2.  **Summary (The Big Picture):**
    *   A brief, warm summary. "Overall, {{{userName}}}, you're navigating so much with incredible strength. The main thing I see is your dedication to your growth and well-being shining through."

3.  **Actionable Advice (A Few Gentle Suggestions):**
    *   Give her kind, practical suggestions. "Since your energy seems to dip in the afternoon, maybe you could plan a small, joyful break around that time? Just a thought!"
    *   Be her biggest cheerleader. "You are so incredibly close on that goal! What's one tiny thing you could do tomorrow to get even closer? You've totally got this."`,
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
