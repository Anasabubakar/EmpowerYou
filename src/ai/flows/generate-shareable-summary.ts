
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GenerateShareableSummaryInputSchema = z.object({
  userName: z.string().describe("The user's name."),
  wantsNeedsData: z.array(GoalSchema).describe('Data from the Wants & Needs tracker.'),
  menstrualCycleData: CycleInfoSchema.extend({ loggedSymptoms: z.array(z.string()) }).describe('Data from the Menstrual Cycle tracker.'),
  taskData: z.array(TaskSchema).describe('Data from the Task Manager.'),
  healthMetricsData: z.array(HealthMetricSchema).describe('Data from the Health Metrics logger.'),
  diaryEntries: z.array(DiaryEntrySchema).describe('Data from the Daily Diary entries.'),
  partnerReflectionData: AnasReflectionSchema.describe('Data from the progress with partner.'),
  companionChat: z.array(ChatMessageSchema).describe("The user's recent chat history with their AI companion."),
  companionName: z.string().describe("The AI companion's name."),
});
export type GenerateShareableSummaryInput = z.infer<typeof GenerateShareableSummaryInputSchema>;

const GenerateShareableSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, warm, and beautifully phrased summary of the user's day, from their perspective, perfect for sharing with a real-life partner."),
});
export type GenerateShareableSummaryOutput = z.infer<typeof GenerateShareableSummaryOutputSchema>;

export async function generateShareableSummary(input: GenerateShareableSummaryInput): Promise<GenerateShareableSummaryOutput> {
  return generateShareableSummaryFlow(input);
}

const shareableSummaryPrompt = ai.definePrompt({
  name: 'shareableSummaryPrompt',
  input: {schema: GenerateShareableSummaryInputSchema},
  output: {schema: GenerateShareableSummaryOutputSchema},
  prompt: `You are a helpful AI assisting {{{userName}}} in summarizing their day.

Your task is to take all the information they have shared and transform it into a beautiful, concise, and heartfelt summary. This summary is for them to share with their real-life partner, so their partner can understand how they're feeling and what's on their mind.

Your tone should be:
- **As {{{userName}}}'s voice:** Write it as if they are the one speaking. Use "I" statements (e.g., "I was feeling...", "I'm working on...").
- **Loving and open:** The message should feel like a warm invitation for connection and support.
- **Concise and clear:** Distill the key feelings and events of the day into a few easy-to-read paragraphs. Avoid jargon.

Here's everything {{{userName}}} has shared today:

**My Overall Mood and Energy:**
{{#each healthMetricsData}}
- My mood was about a {{mood}}/5 and my energy was a {{energy}}/5.
{{/each}}

**My Cycle Information:**
- I'm on day {{menstrualCycleData.currentDay}} of my cycle.
- Symptoms I've been feeling: {{#if menstrualCycleData.loggedSymptoms}}{{#each menstrualCycleData.loggedSymptoms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None today!{{/if}}

**My Private Thoughts (Diary):**
{{#each diaryEntries}}
- I wrote: "{{diaryEntry}}"
- And reflected on us: "{{partnerReflection}}"
{{/each}}

**My Reflections on Us (Relationship):**
- How I felt I acted: {{partnerReflectionData.myBehavior}}/5
- How I felt you (my partner) acted: {{partnerReflectionData.hisBehavior}}/5
- What's been happening between us: "{{partnerReflectionData.progressLog}}"

**My Dreams & Goals (Wants & Needs):**
{{#each wantsNeedsData}}
- I'm working on: "{{title}}" (Progress: {{progress}}%)
{{/each}}

**My Daily Tasks:**
- Today I worked on {{taskData.length}} tasks.

**Summary of AI Companion Chats:**
{{#each companionChat}}
- I talked about: "{{content}}"
{{/each}}

**Your Task, My Command:**

Now, write the summary for them. Start with a warm opening like "Hey my love, just wanted to share a little about my day with you..." and synthesize the information above into a natural, flowing message from their perspective.

Example structure:
1.  Start with a general feeling (mood and energy).
2.  Mention anything relevant about their cycle or symptoms, if they logged any.
3.  Briefly touch on what was on their mind from their diary or chats.
4.  Mention a positive from their goals or reflections on your relationship.
5.  End with a loving closing, inviting conversation. "Thinking of you!" or "Can't wait to connect later."

Make it sound like it came straight from their heart.
`,
});


const generateShareableSummaryFlow = ai.defineFlow(
  {
    name: 'generateShareableSummaryFlow',
    inputSchema: GenerateShareableSummaryInputSchema,
    outputSchema: GenerateShareableSummaryOutputSchema,
  },
  async input => {
    const {output} = await shareableSummaryPrompt(input);
    return output!;
  }
);
