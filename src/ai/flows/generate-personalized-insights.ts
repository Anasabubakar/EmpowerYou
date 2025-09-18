
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
  insights: z.string().describe('Deep, personalized insights and trend analysis, written in a friendly and encouraging tone. Mention the user by name.'),
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
  prompt: `You are a holistic wellness coach AI. Your goal is to provide deep, personalized, and actionable insights to a user named {{{userName}}} based on the data they've tracked in their app. The current date is {{{currentDate}}}.

Analyze the following data, paying close attention to the connections between different areas of their life and the timing of their entries.

**Wants & Needs (Goals):**
{{#each wantsNeedsData}}
- Goal: "{{title}}" ({{category}})
  - Progress: {{progress}}%
  - Deadline: {{deadline}}
  - Created On: {{createdAt}}
  - Description: {{description}}
{{/each}}

**Tasks:**
{{#each taskData}}
- Task: "{{text}}" (Priority: {{priority}})
  - Completed: {{completed}}
  - Created On: {{createdAt}}
{{/each}}

**Health Metrics:**
{{#each healthMetricsData}}
- Date: {{date}} (Logged At: {{createdAt}})
  - Mood: {{mood}}/5
  - Energy: {{energy}}/5
{{/each}}

**Menstrual Cycle:**
- Currently on day {{menstrualCycleData.currentDay}} of their cycle.
- Next period predicted in {{menstrualCycleData.nextPeriodIn}} days.
- Logged Symptoms: {{#if menstrualCycleData.loggedSymptoms}}{{#each menstrualCycleData.loggedSymptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

**Recent Diary Entries:**
{{#each diaryEntries}}
- Entry from {{createdAt}}: "{{diaryEntry}}"
  - Mood: {{mood}}, Energy: {{energyLevels}}
  - Partner Reflection: {{partnerReflection}}
  - Wants/Needs Progress: {{wantsNeedsProgress}}
{{/each}}

**Relationship Reflection:**
- How I acted: {{partnerReflectionData.myBehavior}}/5
- How they acted: {{partnerReflectionData.hisBehavior}}/5
- Progress Log: "{{partnerReflectionData.progressLog}}"
- Plans: "{{partnerReflectionData.plans}}"


**Your Task:**
Generate a report with three sections: Insights, Summary, and Advice.

1.  **Insights:**
    *   Identify hidden patterns and trends. How does mood/energy correlate with tasks, cycle day, or relationship interactions?
    *   Look at the createdAt timestamps. Are there patterns in when certain moods, energy levels, or symptoms are logged (e.g., "I notice you often log low energy in the afternoons")?
    *   Connect their diary entries to their goals. Are their daily actions aligning with what they want and need?
    *   Be empathetic and encouraging. Address {{{userName}}} directly. Frame your insights in a positive, growth-oriented way.

2.  **Summary:**
    *   Provide a brief, high-level overview of the key takeaways from your analysis. What are the most important things {{{userName}}} should know?

3.  **Actionable Advice:**
    *   Give specific, concrete, and practical suggestions.
    *   If you see a pattern of low energy, suggest a small, manageable action.
    *   If progress on a "need" goal is stalled, offer a gentle nudge or a strategy to get started.
    *   If their relationship reflections show a positive trend, encourage them to continue that behavior.
    *   Make the advice forward-looking and empowering.`,
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
