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
  forecast: z.string().describe('A detailed 1-day air quality forecast, including primary pollutants and health recommendations.'),
  currentAqi: z.number().describe('The current Air Quality Index (AQI) value for the location.'),
  sparklineData: z.array(z.number()).describe('An array of 30 integer numbers representing the forecasted AQI for the next 30 days for a sparkline chart.'),
});
export type ForecastAirQualityOutput = z.infer<typeof ForecastAirQualityOutputSchema>;

export async function forecastAirQuality(input: ForecastAirQualityInput): Promise<ForecastAirQualityOutput> {
  return forecastAirQualityFlow(input);
}

const forecastAirQualityPrompt = ai.definePrompt({
  name: 'forecastAirQualityPrompt',
  input: {schema: ForecastAirQualityInputSchema},
  output: {schema: ForecastAirQualityOutputSchema},
  prompt: `You are an expert meteorologist and air quality scientist. Based on the provided location, generate a detailed 1-day air quality forecast and a 30-day AQI forecast.

The 1-day forecast should include the primary pollutants, the current AQI (Air Quality Index) value, and health recommendations.

The 30-day AQI forecast should be an array of 30 integers (from 0 to 300) for a sparkline chart.

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
    const {output} = await forecastAirQualityPrompt(input);
    return output!;
  }
);
