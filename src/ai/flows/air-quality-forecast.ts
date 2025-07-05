'use server';

/**
 * @fileOverview A flow to forecast air quality for a specified location using multiple data sources.
 *
 * - forecastAirQuality - A function that handles the air quality forecasting process.
 * - ForecastAirQualityInput - The input type for the forecastAirQuality function.
 * - ForecastAirQualityOutput - The return type for the forecastAirQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Mock Tool: Simulates fetching satellite data
const getSatelliteData = ai.defineTool(
  {
    name: 'getSatelliteData',
    description: 'Retrieves satellite imagery analysis for a given location, focusing on aerosol optical depth and cloud cover.',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.object({
      aerosolOpticalDepth: z.number().describe('A value from 0 to 1 indicating aerosol density.'),
      cloudCover: z.number().describe('A percentage from 0 to 100 indicating cloud coverage.'),
    }),
  },
  async ({ location }) => {
    console.log(`[Tool] Fetching satellite data for ${location}`);
    // In a real app, this would call a remote API.
    // Here, we generate mock data based on the location string length for variability.
    const seed = location.length;
    return {
      aerosolOpticalDepth: (seed % 10) / 10,
      cloudCover: (seed * 7) % 100,
    };
  }
);

// Mock Tool: Simulates fetching ground sensor data
const getGroundSensorData = ai.defineTool(
  {
    name: 'getGroundSensorData',
    description: 'Retrieves data from ground-based air quality sensors for a specific location.',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.object({
      pm25: z.number().describe('Particulate Matter 2.5 concentration in µg/m³.'),
      o3: z.number().describe('Ozone concentration in ppb.'),
      no2: z.number().describe('Nitrogen Dioxide concentration in ppb.'),
    }),
  },
  async ({ location }) => {
    console.log(`[Tool] Fetching ground sensor data for ${location}`);
    // Mock data generation
    const seed = location.length;
    return {
      pm25: (seed * 2.5) % 150,
      o3: (seed * 1.5) % 80,
      no2: (seed * 0.8) % 50,
    };
  }
);

// Mock Tool: Simulates fetching weather model data
const getWeatherModelData = ai.defineTool(
  {
    name: 'getWeatherModelData',
    description: 'Retrieves weather forecast data for a location, including wind speed, direction, and chance of precipitation, which influence air quality.',
    inputSchema: z.object({ location: z.string() }),
    outputSchema: z.object({
      windSpeed: z.number().describe('Wind speed in km/h.'),
      windDirection: z.string().describe('Wind direction (e.g., N, S, E, W, NE).'),
      precipitationChance: z.number().describe('Percentage chance of precipitation.'),
    }),
  },
  async ({ location }) => {
    console.log(`[Tool] Fetching weather model data for ${location}`);
    // Mock data generation
    const seed = location.length;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return {
      windSpeed: (seed * 1.2) % 30,
      windDirection: directions[seed % directions.length],
      precipitationChance: (seed * 5) % 100,
    };
  }
);


const ForecastAirQualityInputSchema = z.object({
  location: z.string().describe('The location to forecast air quality for.'),
});
export type ForecastAirQualityInput = z.infer<typeof ForecastAirQualityInputSchema>;

const PollutantSchema = z.object({
    name: z.string().describe('Name of the pollutant (e.g., PM2.5, O3, NO2).'),
    aqi: z.number().describe('The AQI value for this specific pollutant.'),
    recommendation: z.string().describe('A brief recommendation related to this pollutant.'),
});

const ForecastAirQualityOutputSchema = z.object({
  forecast: z.string().describe('A detailed 1-day air quality forecast summary, incorporating all data sources, and including health recommendations.'),
  currentAqi: z.number().describe('The current overall Air Quality Index (AQI) value for the location. This should be calculated based on the pollutant levels.'),
  pollutants: z.array(PollutantSchema).describe('A list of primary pollutants, their specific AQI, and related recommendations.'),
  sparklineData: z.array(z.number()).describe('An array of 30 integer numbers representing the forecasted AQI for the next 30 days for a sparkline chart.'),
  healthRecommendations: z.object({
      generalPublic: z.string().describe('Health advice for the general public.'),
      sensitiveGroups: z.string().describe('Specific health advice for sensitive groups like children, the elderly, and people with respiratory issues.'),
  }).describe('Detailed health recommendations based on the forecast.'),
});
export type ForecastAirQualityOutput = z.infer<typeof ForecastAirQualityOutputSchema>;

export async function forecastAirQuality(input: ForecastAirQualityInput): Promise<ForecastAirQualityOutput> {
  return forecastAirQualityFlow(input);
}

const forecastAirQualityPrompt = ai.definePrompt({
  name: 'forecastAirQualityPrompt',
  input: {schema: ForecastAirQualityInputSchema},
  output: {schema: ForecastAirQualityOutputSchema},
  tools: [getSatelliteData, getGroundSensorData, getWeatherModelData],
  prompt: `You are an expert meteorologist and air quality scientist. Your task is to generate a comprehensive air quality forecast for a given location.

To do this, you MUST first use the available tools to gather data:
1.  Call 'getSatelliteData' to get satellite-based observations.
2.  Call 'getGroundSensorData' to get measurements from local sensors.
3.  Call 'getWeatherModelData' to get the weather forecast, as wind and rain significantly impact air quality.

Once you have the data from all three tools, synthesize it to create your forecast.

The forecast must include:
- A detailed 1-day summary forecast that explains how the weather (wind, rain) will affect air quality.
- The overall current AQI for the location, calculated based on the available pollutant data.
- A breakdown of individual pollutants (PM2.5, O3, NO2), their specific AQI values, and a brief recommendation for each.
- A 30-day AQI forecast as an array of 30 integers (from 0 to 300) for a sparkline chart.
- Detailed health recommendations: one for the general public and another specifically for sensitive groups (children, elderly, individuals with health conditions).

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
