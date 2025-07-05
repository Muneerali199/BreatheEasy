"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { forecastAirQuality, type ForecastAirQualityOutput } from '@/ai/flows/air-quality-forecast';
import { Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart } from "recharts"
import GoodAirIcon from '@/components/icons/GoodAirIcon';
import ModerateAirIcon from '@/components/icons/ModerateAirIcon';
import PoorAirIcon from '@/components/icons/PoorAirIcon';

const formSchema = z.object({
  location: z.string().min(2, "Location must be at least 2 characters."),
});
type FormValues = z.infer<typeof formSchema>;

const getAqiInfo = (aqi: number | undefined) => {
    if (aqi === undefined) return { level: null, Icon: null };
    if (aqi <= 50) {
        return { level: 'Good', Icon: GoodAirIcon };
    }
    if (aqi <= 100) {
        return { level: 'Moderate', Icon: ModerateAirIcon };
    }
    return { level: 'Unhealthy', Icon: PoorAirIcon };
};

export default function DashboardPage() {
  const [forecast, setForecast] = useState<ForecastAirQualityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { location: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);
    try {
      const result = await forecastAirQuality(data);
      setForecast(result);
    } catch (e) {
      setError("Failed to get forecast. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = forecast?.sparklineData.map((value, index) => ({ day: index, value })) || [];
  const chartConfig = {
    value: {
      label: "AQI",
      color: "hsl(var(--primary))",
    },
  };
  
  const { level: aqiLevel, Icon: AqiIcon } = getAqiInfo(forecast?.currentAqi);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Air Quality Dashboard</h1>
        <p className="text-muted-foreground">Get real-time air quality forecasts for any location.</p>
      </div>
      
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline">Location Forecast</CardTitle>
          <CardDescription>Enter a city to get its air quality forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Forecast
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10 rounded-xl">
          <CardHeader>
            <CardTitle className="text-destructive font-headline">An Error Occurred</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {forecast && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline">Forecast for {form.getValues('location')}</CardTitle>
                <CardDescription>
                  Current AQI: <span className="font-bold">{forecast.currentAqi}</span> ({aqiLevel})
                </CardDescription>
              </div>
              {AqiIcon && <AqiIcon className="h-12 w-12" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <p className="text-foreground/80">{forecast.forecast}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">30-Day AQI Trend</h3>
              <ChartContainer config={chartConfig} className="h-[150px] w-full">
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="value"
                    type="natural"
                    fill="url(#fillValue)"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Air Quality Levels Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Good</CardTitle>
                      <GoodAirIcon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">0-50</div>
                      <p className="text-xs text-muted-foreground">Air quality is satisfactory.</p>
                  </CardContent>
              </Card>
              <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Moderate</CardTitle>
                      <ModerateAirIcon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">51-100</div>
                      <p className="text-xs text-muted-foreground">Some pollutants may be a concern.</p>
                  </CardContent>
              </Card>
              <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unhealthy</CardTitle>
                      <PoorAirIcon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">101+</div>
                      <p className="text-xs text-muted-foreground">Health effects can be immediately felt.</p>
                  </CardContent>
              </Card>
          </div>
      </div>

    </div>
  );
}
