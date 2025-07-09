// src/ai/flows/notification-strategy.ts
'use server';
/**
 * @fileOverview A flow to suggest notification strategies based on user location and risk factors.
 *
 * - getNotificationStrategy - A function that returns a notification strategy.
 * - NotificationStrategyInput - The input type for the getNotificationStrategy function.
 * - NotificationStrategyOutput - The return type for the getNotificationStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationStrategyInputSchema = z.object({
  location: z.string().describe('The user\s location as a city and country.'),
  riskFactors: z
    .string()
    .describe(
      'A comma separated list of risk factors for air quality, such as asthma, age, or heart condition.'
    ),
});
export type NotificationStrategyInput = z.infer<typeof NotificationStrategyInputSchema>;

const NotificationStrategyOutputSchema = z.object({
  strategy: z
    .string()
    .describe(
      'A notification strategy with specific thresholds based on the users location and risk factors. Include specific AQI thresholds for different pollutants and their health implications.'
    ),
});
export type NotificationStrategyOutput = z.infer<typeof NotificationStrategyOutputSchema>;

export async function getNotificationStrategy(
  input: NotificationStrategyInput
): Promise<NotificationStrategyOutput> {
  return notificationStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'notificationStrategyPrompt',
  input: {schema: NotificationStrategyInputSchema},
  output: {schema: NotificationStrategyOutputSchema},
  prompt: `You are an expert in air quality and health.

You will suggest a notification strategy for the user based on their location and risk factors.

Location: {{{location}}}
Risk Factors: {{{riskFactors}}}

Suggest a detailed notification strategy, including specific AQI thresholds for different pollutants and their health implications.`,
});

const notificationStrategyFlow = ai.defineFlow(
  {
    name: 'notificationStrategyFlow',
    inputSchema: NotificationStrategyInputSchema,
    outputSchema: NotificationStrategyOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (e: any) {
        lastError = e;
        if (e.message?.includes('503') || e.message?.includes('overloaded')) {
          console.log(`Attempt ${attempt + 1} failed due to model overload. Retrying in ${attempt + 1}s...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        } else {
          // Not a retryable error, so throw immediately.
          throw e;
        }
      }
    }
    // If all retries fail, throw a user-friendly error.
    console.error("All retries failed for notificationStrategyFlow.", lastError);
    throw new Error('The AI service is currently overloaded and unable to handle the request. Please try again later.');
  }
);
