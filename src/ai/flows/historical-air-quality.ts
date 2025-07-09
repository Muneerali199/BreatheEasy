
'use server';

/**
 * @fileOverview A flow to retrieve and analyze historical air quality data for a specified location and date range.
 *
 * - getHistoricalAirQuality - A function that handles the historical data retrieval and analysis.
 * - HistoricalAirQualityInput - The input type for the function.
 * - HistoricalAirQualityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { subDays, format } from 'date-fns';

const HistoricalAirQualityInputSchema = z.object({
  city: z.string().describe('The city for the historical data.'),
  state: z.string().describe('The state or province.'),
  country: z.string().describe('The country.'),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).describe('The date range for the historical data.'),
});
export type HistoricalAirQualityInput = z.infer<typeof HistoricalAirQualityInputSchema>;

const HistoricalDataPointSchema = z.object({
  date: z.string().describe("The date for the data point in 'MMM d' format (e.g., 'Jan 1')."),
  aqi: z.number().describe('The average AQI value for that day.'),
});

const HistoricalAirQualityOutputSchema = z.object({
  summary: z.string().describe('An AI-generated analysis of the historical air quality trends, highlighting key patterns, highs, and lows. This should be formatted in Markdown.'),
  chartData: z.array(HistoricalDataPointSchema).describe('An array of historical data points for the date range, formatted for charting.'),
});
export type HistoricalAirQualityOutput = z.infer<typeof HistoricalAirQualityOutputSchema>;


// Mock Function: Simulates fetching historical data from a database or API.
const getHistoricalData = async (
    location: { city: string; state: string; country: string },
    dateRange: { from: Date; to: Date }
  ): Promise<Array<{ date: string; aqi: number }>> => {
    console.log(`[Mock] Fetching historical data for ${location.city} from ${dateRange.from} to ${dateRange.to}`);
    
    const data: Array<{ date: string; aqi: number }> = [];
    let currentDate = new Date(dateRange.from);
  
    while (currentDate <= dateRange.to) {
      // Simulate daily fluctuations with some randomness
      const baseAqi = 75; // Average AQI for this mock region
      const seasonalFactor = Math.sin((currentDate.getMonth() / 12) * Math.PI * 2) * 30; // +/- 30 AQI based on season
      const randomNoise = (Math.random() - 0.5) * 40; // +/- 20 AQI random daily noise
      const aqi = Math.max(10, Math.round(baseAqi + seasonalFactor + randomNoise));
      
      data.push({
        date: format(currentDate, 'MMM d'),
        aqi,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
};

const HistoricalAirQualityPromptInputSchema = z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
    dateRange: z.object({ from: z.date(), to: z.date() }),
    historicalData: z.array(HistoricalDataPointSchema),
});


export async function getHistoricalAirQuality(input: HistoricalAirQualityInput): Promise<HistoricalAirQualityOutput> {
  return historicalAirQualityFlow(input);
}


const prompt = ai.definePrompt({
    name: 'historicalAirQualityPrompt',
    input: { schema: HistoricalAirQualityPromptInputSchema },
    output: { schema: HistoricalAirQualityOutputSchema },
    prompt: `You are an environmental data scientist. Analyze the provided historical air quality data for the specified location and time range.

Location: {{{city}}}, {{{state}}}, {{{country}}}
Date Range: From {{{dateRange.from}}} to {{{dateRange.to}}}

Historical Data:
{{#each historicalData}}
- Date: {{{this.date}}}, AQI: {{{this.aqi}}}
{{/each}}

Based on this data, write a concise summary of the air quality trends. Format the summary using Markdown. Use bold text to highlight key patterns, and use bullet points to list out significant periods of high or low pollution. Provide a brief explanation for potential causes if possible (e.g., "a spike in mid-summer could be related to heat and stagnant air"). Do not invent data not present.

Your output must be a JSON object matching the specified schema. The 'chartData' should be the exact data provided to you.
`,
  });
  

const historicalAirQualityFlow = ai.defineFlow(
  {
    name: 'historicalAirQualityFlow',
    inputSchema: HistoricalAirQualityInputSchema,
    outputSchema: HistoricalAirQualityOutputSchema,
  },
  async (input) => {
    const historicalData = await getHistoricalData(input, input.dateRange);
    
    const maxRetries = 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { output } = await prompt({
          ...input,
          historicalData,
        });
        
        // The AI might subtly change the data, so we ensure the original data is returned for charting.
        return {
            summary: output!.summary,
            chartData: historicalData,
        };
      } catch (e: any) {
        lastError = e;
        if (e.message?.includes('503') || e.message?.includes('overloaded')) {
          console.log(`Attempt ${attempt + 1} failed due to model overload. Retrying in ${attempt + 1}s...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        } else {
          throw e;
        }
      }
    }
    console.error("All retries failed for historicalAirQualityFlow.", lastError);
    throw new Error('The AI service is currently overloaded and unable to handle the request. Please try again later.');
  }
);
