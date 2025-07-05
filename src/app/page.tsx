
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { forecastAirQuality } from '@/ai/flows/air-quality-forecast';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart } from "recharts"
import GoodAirIcon from '@/components/icons/GoodAirIcon';
import ModerateAirIcon from '@/components/icons/ModerateAirIcon';
import PoorAirIcon from '@/components/icons/PoorAirIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForecast } from '@/context/ForecastContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getSupportedLocations } from './actions';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const formSchema = z.object({
  location: z.string({ required_error: "Please select a location." }).min(1, "Please select a location."),
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

const getPollutantBadgeVariant = (aqi: number): "good" | "moderate" | "destructive" => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    return "destructive";
};

export default function DashboardPage() {
  const { forecast, setForecast, isLoading, setIsLoading } = useForecast();
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { location: "" },
  });

  const handleSearch = async (query: string) => {
    const result = await getSupportedLocations(query);
    setSuggestions(result);
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    const parts = data.location.split(',').map(p => p.trim());
    
    let city: string, state: string, country: string;

    if (parts.length === 3) {
      // Assumes "City, State, Country" format
      city = parts[0];
      state = parts[1];
      country = parts[2];
    } else if (parts.length === 2) {
      // Assumes "City, Country", so state is same as city for API
      city = parts[0];
      state = parts[0];
      country = parts[1];
    } else {
      setError("Invalid location format. Please select a valid location from the list.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await forecastAirQuality({ city, state, country });
      setForecast(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while fetching the forecast.");
      }
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
          <CardTitle>Location Forecast</CardTitle>
          <CardDescription>Enter a location to get its air quality forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Location</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Select a location..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search for a location..."
                            onValueChange={handleSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {suggestions.map((suggestion) => (
                                <CommandItem
                                  value={suggestion}
                                  key={suggestion}
                                  onSelect={() => {
                                    form.setValue("location", suggestion);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      suggestion === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {suggestion}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
            <CardTitle className="text-destructive">An Error Occurred</CardTitle>
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
                <CardTitle>Forecast for {form.getValues('location')}</CardTitle>
                <CardDescription>
                  Current AQI: <span className="font-bold">{forecast.currentAqi}</span> ({aqiLevel})
                </CardDescription>
              </div>
              {AqiIcon && <AqiIcon className="h-12 w-12" />}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pollutants">Pollutants</TabsTrigger>
                <TabsTrigger value="health">Health Advice</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Overall Forecast</h3>
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
              </TabsContent>
              <TabsContent value="pollutants" className="mt-4">
                {forecast.pollutants && forecast.pollutants.length > 0 && (
                  <div>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pollutant</TableHead>
                            <TableHead className="text-center">AQI</TableHead>
                            <TableHead>Recommendation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {forecast.pollutants.map((pollutant) => (
                            <TableRow key={pollutant.name}>
                              <TableCell className="font-medium">{pollutant.name}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={getPollutantBadgeVariant(pollutant.aqi)}>
                                  {pollutant.aqi}
                                </Badge>
                              </TableCell>
                              <TableCell>{pollutant.recommendation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="health" className="mt-4">
                {forecast.healthRecommendations && (
                    <div>
                        <Accordion type="single" collapsible className="w-full" defaultValue="general">
                          <AccordionItem value="general">
                            <AccordionTrigger>For the General Public</AccordionTrigger>
                            <AccordionContent>
                              {forecast.healthRecommendations.generalPublic}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="sensitive">
                            <AccordionTrigger>For Sensitive Groups</AccordionTrigger>
                            <AccordionContent>
                              {forecast.healthRecommendations.sensitiveGroups}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <div className="pt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Air Quality Levels Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-xl transition-transform duration-200 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Good</CardTitle>
                      <GoodAirIcon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">0-50</div>
                      <p className="text-xs text-muted-foreground">Air quality is satisfactory.</p>
                  </CardContent>
              </Card>
              <Card className="rounded-xl transition-transform duration-200 hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Moderate</CardTitle>
                      <ModerateAirIcon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">51-100</div>
                      <p className="text-xs text-muted-foreground">Some pollutants may be a concern.</p>
                  </CardContent>
              </Card>
              <Card className="rounded-xl transition-transform duration-200 hover:scale-105">
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
