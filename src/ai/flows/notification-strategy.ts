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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
