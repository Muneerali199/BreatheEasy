
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { forecastAirQuality } from '@/ai/flows/air-quality-forecast';
import { Loader2, Check, ChevronsUpDown, Cloud, Sun, Wind, Mountain } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts"
import GoodAirIcon from '@/components/icons/GoodAirIcon';
import ModerateAirIcon from '@/components/icons/ModerateAirIcon';
import PoorAirIcon from '@/components/icons/PoorAirIcon';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForecast } from '@/context/ForecastContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getSupportedLocations } from './actions';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Globe from '@/components/globe/globe';

const formSchema = z.object({
  location: z.string({ required_error: "Please select a location." }).min(1, "Please select a location."),
});
type FormValues = z.infer<typeof formSchema>;

const getAqiInfo = (aqi: number | undefined) => {
    if (aqi === undefined) return { level: 'Unknown', Icon: null, color: '', bgColor: 'bg-card' };
    if (aqi <= 50) {
        return { level: 'Good', Icon: GoodAirIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
    }
    if (aqi <= 100) {
        return { level: 'Moderate', Icon: ModerateAirIcon, color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
    }
    return { level: 'Unhealthy', Icon: PoorAirIcon, color: 'text-red-500', bgColor: 'bg-red-500/10' };
};

const getPollutantInfo = (pollutantName: string, aqi: number) => {
    const info: { variant: "good" | "moderate" | "destructive", indicatorClassName: string, icon: React.ReactNode } = {
        variant: 'good',
        indicatorClassName: 'bg-emerald-500',
        icon: <Mountain className="h-5 w-5 text-muted-foreground" />,
    };

    if (aqi > 100) {
        info.variant = 'destructive';
        info.indicatorClassName = 'bg-red-500';
    } else if (aqi > 50) {
        info.variant = 'moderate';
        info.indicatorClassName = 'bg-amber-500';
    }

    if (pollutantName.includes('PM2.5')) {
        info.icon = <Cloud className="h-5 w-5 text-muted-foreground" />;
    } else if (pollutantName.includes('O3')) {
        info.icon = <Sun className="h-5 w-5 text-muted-foreground" />;
    } else if (pollutantName.includes('NO2')) {
        info.icon = <Wind className="h-5 w-5 text-muted-foreground" />;
    }

    return info;
};

export default function DashboardPage() {
  const { forecast, setForecast, isLoading, setIsLoading } = useForecast();
  const [error, setError] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { location: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    const parts = data.location.split(',').map(p => p.trim());
    const [city, state, country] = parts;

    if (parts.length < 3) {
        setError("Invalid location format. Please select a valid location from the list.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await forecastAirQuality({ city, state, country });
      setForecast(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [setForecast, setIsLoading]);

  useEffect(() => {
    if (!popoverOpen) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const result = await getSupportedLocations(searchQuery);
      setSuggestions(result);
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 150); // Debounce API calls

    return () => clearTimeout(timer);
  }, [searchQuery, popoverOpen]);

  const handleLocationSelect = (location: string) => {
    form.setValue("location", location);
    setPopoverOpen(false);
    // Use a short timeout to allow the popover to close before submitting
    setTimeout(() => {
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 50);
  };


  const chartData = forecast?.sparklineData.map((value, index) => ({ day: index, aqi: value })) || [];
  const chartConfig = {
    aqi: { label: "AQI", color: "hsl(var(--primary))" },
  };
  
  const { level: aqiLevel, Icon: AqiIcon, color: aqiColor, bgColor: aqiBgColor } = getAqiInfo(forecast?.currentAqi);

  return (
    <div className="w-full">
        {!forecast && !isLoading && !error && (
             <div className="relative w-full h-[calc(100vh-8rem)] flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-50">
                    <Globe />
                </div>
                <div className="relative z-10 w-full max-w-md">
                     <Card className="shadow-2xl rounded-xl border-2">
                        <CardHeader>
                            <CardTitle className="text-3xl">BreatheEasy</CardTitle>
                            <CardDescription>Get real-time air quality forecasts powered by AI.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                              >
                                                {field.value || "Select a location..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command filter={() => 1}>
                                              <CommandInput placeholder="Search for a location..." value={searchQuery} onValueChange={setSearchQuery} />
                                              <CommandList>
                                                <CommandEmpty>No location found.</CommandEmpty>
                                                <CommandGroup>
                                                  {suggestions.map((suggestion) => (
                                                    <CommandItem
                                                      value={suggestion}
                                                      key={suggestion}
                                                      onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                      }}
                                                      onSelect={() => handleLocationSelect(suggestion)}
                                                    >
                                                      <Check className={cn("mr-2 h-4 w-4", suggestion === field.value ? "opacity-100" : "opacity-0")} />
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
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

      {(isLoading || error) && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-8 space-y-4">
            {isLoading && <>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-muted-foreground">Fetching live data and generating your forecast...</p>
            </>}
            {error && (
                <Card className="border-destructive bg-destructive/10 rounded-xl max-w-lg shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={() => {
                            setError(null);
                            setForecast(null);
                            form.reset();
                        }} variant="outline" className="mt-4">Try again</Button>
                    </CardContent>
                </Card>
            )}
        </div>
      )}

      {forecast && (
        <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
            <Card className={cn("shadow-xl rounded-xl", aqiBgColor)}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Forecast for {form.getValues('location')}</CardTitle>
                            <CardDescription>
                            Current AQI: <span className={cn("font-bold", aqiColor)}>{forecast.currentAqi}</span> ({aqiLevel})
                            </CardDescription>
                        </div>
                        {AqiIcon && <AqiIcon className="h-12 w-12" />}
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xl rounded-xl">
                        <CardHeader>
                            <CardTitle>AI-Powered Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">{forecast.forecast}</div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-xl rounded-xl">
                        <CardHeader>
                            <CardTitle>30-Day AQI Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <AreaChart data={chartData} margin={{ left: -20, right: 20, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tickFormatter={(val) => `Day ${val + 1}`} tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis domain={['dataMin - 20', 'dataMax + 20']} allowDataOverflow={true} />
                                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={true} />
                                    <defs>
                                        <linearGradient id="fillAqi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-aqi)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-aqi)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <Area dataKey="aqi" type="natural" fill="url(#fillAqi)" stroke="var(--color-aqi)" stackId="a" />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-xl rounded-xl">
                        <CardHeader>
                            <CardTitle>Primary Pollutants</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {forecast.pollutants.map((pollutant) => {
                                const { variant, indicatorClassName, icon } = getPollutantInfo(pollutant.name, pollutant.aqi);
                                return (
                                    <div key={pollutant.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {icon}
                                                <span className="font-medium">{pollutant.name}</span>
                                            </div>
                                            <Badge variant={variant}>{pollutant.aqi}</Badge>
                                        </div>
                                        <Progress value={pollutant.aqi} max={300} indicatorClassName={indicatorClassName} />
                                        <p className="text-xs text-muted-foreground mt-1">{pollutant.recommendation}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                    <Card className="shadow-xl rounded-xl">
                        <CardHeader>
                            <CardTitle>Health Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full" defaultValue="general">
                                <AccordionItem value="general">
                                    <AccordionTrigger>For the General Public</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">{forecast.healthRecommendations.generalPublic}</div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="sensitive">
                                    <AccordionTrigger>For Sensitive Groups</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">{forecast.healthRecommendations.sensitiveGroups}</div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
