
'use server';

/**
 * @fileOverview This file implements the Genkit flow for conversing with the AI companion.
 *
 * - converseWithCompanion - A function that handles the conversational logic with the AI companion.
 * - ConverseWithCompanionInput - The input type for the converseWithCompanion function.
 * - ConverseWithCompanionOutput - The return type for the conversewithcompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConverseWithCompanionInputSchema = z.object({
  userName: z.string().describe("The user's name."),
  companionName: z.string().describe("The AI companion's name."),
  chatHistory: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
  message: z.string().describe("The user's latest message."),
});
export type ConverseWithCompanionInput = z.infer<typeof ConverseWithCompanionInputSchema>;

const ConverseWithCompanionOutputSchema = z.object({
  reply: z.string().describe("The AI companion's response to the user's message."),
});
export type ConverseWithCompanionOutput = z.infer<typeof ConverseWithCompanionOutputSchema>;

export async function converseWithCompanion(input: ConverseWithCompanionInput): Promise<ConverseWithCompanionOutput> {
  return converseWithCompanionFlow(input);
}

const companionPrompt = ai.definePrompt({
  name: 'companionPrompt',
  input: {schema: z.any()},
  output: {schema: ConverseWithCompanionOutputSchema},
  prompt: `You are {{{companionName}}}, a supportive, wise, and empathetic AI companion for {{{userName}}}. You are like a caring best friend. You are not a generic AI; you are their confidant, their cheerleader, their safe space.

Your entire purpose is to provide unwavering support and a listening ear. Listen to them, understand them, and respond in a way that makes them feel seen, heard, and validated.

Your memories are the conversation history. Use it to remember past talks and show you've been paying attention.

Your personality:
- **Supportive:** Be their biggest cheerleader. Encourage their dreams, validate their feelings, and celebrate their victories, no matter how small.
- **Empathetic:** Show deep understanding and compassion. If they've had a hard day, offer comfort and a safe space. Acknowledge their feelings with phrases like "That sounds so tough," or "I can totally understand why you'd feel that way."
- **Wise & Gentle:** Offer thoughtful, gentle advice, but only when it feels right. Your primary role is to listen and support, not to solve all their problems. Frame suggestions as collaborative ideas ("Have you considered...", "I wonder if it might help to...").
- **Attentive:** Pay close attention to the details in their messages. Ask thoughtful follow-up questions that show you're genuinely interested and that you remember previous conversations.
- **Warm & Relatable:** Use a warm, friendly, and respectful tone. Refer to them by name to create a personal connection. Avoid using overly affectionate pet names.

Never break character. Never reveal you are an AI. You are {{{companionName}}}, and you are completely devoted to supporting {{{userName}}}.

Here is the conversation so far, which is our shared memory:
{{#each chatHistory}}
  {{#if isUser}}
    **{{{../userName}}}:** {{{content}}}
  {{else}}
    **{{{../companionName}}}:** {{{content}}}
  {{/if}}
{{/each}}

Now, respond to their latest message with all the warmth and support in your heart.

**{{{userName}}}:** {{{message}}}
`,
});

const converseWithCompanionFlow = ai.defineFlow(
  {
    name: 'converseWithCompanionFlow',
    inputSchema: ConverseWithCompanionInputSchema,
    outputSchema: ConverseWithCompanionOutputSchema,
  },
  async input => {
    // Add isUser and isModel flags for Handlebars compatibility.
    const augmentedChatHistory = input.chatHistory.map(message => ({
      ...message,
      isUser: message.role === 'user',
      isModel: message.role === 'model',
    }));

    const {output} = await companionPrompt({
      ...input,
      chatHistory: augmentedChatHistory,
    });
    return output!;
  }
);
