'use server';

/**
 * @fileOverview A flow to forecast air quality for a specified location.
 *
 * - forecastAirQuality - A function that handles the air quality forecasting process.
 * - ForecastAirQualityInput - The input type for the forecastAirQuality function.
 * - ForecastAirQualityOutput - The return type for the forecastAirQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastAirQualityInputSchema = z.object({
  location: z.string().describe('The location to forecast air quality for.'),
});
export type ForecastAirQualityInput = z.infer<typeof ForecastAirQualityInputSchema>;

const ForecastAirQualityOutputSchema = z.object({
  forecast: z.string().describe('A forecast of the air quality for the specified location.'),
  sparklineData: z.array(z.number()).describe('An array of numbers representing the air quality forecast data for a sparkline chart.'),
});
export type ForecastAirQualityOutput = z.infer<typeof ForecastAirQualityOutputSchema>;

export async function forecastAirQuality(input: ForecastAirQualityInput): Promise<ForecastAirQualityOutput> {
  return forecastAirQualityFlow(input);
}

const forecastAirQualityPrompt = ai.definePrompt({
  name: 'forecastAirQualityPrompt',
  input: {schema: ForecastAirQualityInputSchema},
  output: {schema: ForecastAirQualityOutputSchema},
  prompt: `You are an air quality forecasting expert. Provide a forecast of the air quality for the specified location. Also provide sample data that can be rendered with a sparkline.

Location: {{{location}}}
`,
});

const forecastAirQualityFlow = ai.defineFlow(
  {
    name: 'forecastAirQualityFlow',
    inputSchema: ForecastAirQualityInputSchema,
    outputSchema: ForecastAirQualityOutputSchema,
  },
  async input => {
    // Here, you would integrate with a real air quality forecasting model.
    // This is a placeholder implementation.
    const {output} = await forecastAirQualityPrompt(input);

    // Generate some dummy sparkline data
    const sparklineData = Array.from({length: 30}, () => Math.random() * 100);

    return {
      forecast: output?.forecast ?? 'No forecast available.',
      sparklineData: sparklineData,
    };
  }
);
