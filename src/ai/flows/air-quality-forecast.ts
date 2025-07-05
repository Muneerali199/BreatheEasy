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

// Real Tool: Fetches ground sensor data from IQAir API
const getGroundSensorData = ai.defineTool(
  {
    name: 'getGroundSensorData',
    description: 'Retrieves real-time data from ground-based air quality sensors for a specific location using the IQAir API.',
    inputSchema: z.object({
        city: z.string(),
        state: z.string(),
        country: z.string(),
    }),
    outputSchema: z.object({
      pm25: z.number().describe('Particulate Matter 2.5 concentration based on US AQI.'),
      o3: z.number().describe('Ozone concentration in ppb.'),
      no2: z.number().describe('Nitrogen Dioxide concentration in ppb.'),
    }),
  },
  async ({ city, state, country }) => {
    console.log(`[Tool] Fetching ground sensor data for ${city}, ${state}, ${country}`);
    const apiKey = process.env.IQAIR_API_KEY;

    if (!apiKey) {
      console.error("IQAir API key is not set in .env file.");
      // The API key is a server configuration issue, so we throw a generic error to the user.
      throw new Error("Could not connect to the data service. Please contact support.");
    }

    const url = `https://api.airvisual.com/v2/city?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'success') {
        const message = data.data?.message || 'an unknown error occurred';
        // Make the error message user-friendly
        if (message === 'city_not_found') {
          throw new Error(`We couldn't find data for "${city}". Please check the location and try again.`);
        }
        throw new Error(`Data service error: ${message}.`);
      }
      
      const pollution = data.data.current.pollution;
      // The free API provides main pollutant and AQI. We'll use aqius for pm2.5.
      // And generate mock data for others as they are not directly available.
      return {
        pm25: pollution.aqius || 0,
        o3: Math.floor(Math.random() * 80), // Mock data as it is not in the free tier
        no2: Math.floor(Math.random() * 50), // Mock data as it is not in the free tier
      };
    } catch (error) {
      // This will catch network errors or if `response.json()` fails.
      console.error("Error fetching or parsing from IQAir API:", error);
      // Re-throw the original user-friendly error if we created one.
      if (error instanceof Error) {
        throw error;
      }
      // Or throw a generic network error.
      throw new Error("Failed to connect to the air quality data service. Please check your network connection.");
    }
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
  city: z.string().describe('The city for the forecast.'),
  state: z.string().describe('The state or province for the forecast.'),
  country: z.string().describe('The country for the forecast.'),
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
1.  Call 'getGroundSensorData' with the provided city, state, and country to get real-time measurements from local sensors.
2.  Call 'getSatelliteData' with just the city name to get satellite-based observations.
3.  Call 'getWeatherModelData' with just the city name to get the weather forecast, as wind and rain significantly impact air quality.

Once you have the data from all three tools, synthesize it to create your forecast.

The forecast must include:
- A detailed 1-day summary forecast that explains how the weather (wind, rain) will affect air quality.
- The overall current AQI for the location, calculated based on the available pollutant data.
- A breakdown of individual pollutants (PM2.5, O3, NO2), their specific AQI values, and a brief recommendation for each.
- A 30-day AQI forecast as an array of 30 integers (from 0 to 300) for a sparkline chart.
- Detailed health recommendations: one for the general public and another specifically for sensitive groups (children, elderly, individuals with health conditions).

Location: {{{city}}}, {{{state}}}, {{{country}}}
`,
});

const forecastAirQualityFlow = ai.defineFlow(
  {
    name: 'forecastAirQualityFlow',
    inputSchema: ForecastAirQualityInputSchema,
    outputSchema: ForecastAirQualityOutputSchema,
  },
  async (input) => {
    // We need to pass a single string to the mock tools
    const locationString = `${input.city}, ${input.state}`;
    
    const {output} = await forecastAirQualityPrompt({
      ...input,
      // Provide the tools with the inputs they expect
      getGroundSensorData: input,
      getSatelliteData: { location: locationString },
      getWeatherModelData: { location: locationString },
    });
    return output!;
  }
);
