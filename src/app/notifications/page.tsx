"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { getNotificationStrategy, type NotificationStrategyOutput } from '@/ai/flows/notification-strategy';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  location: z.string().min(2, "Location must be at least 2 characters."),
  riskFactors: z.string().min(2, "Please enter at least one risk factor."),
});
type FormValues = z.infer<typeof formSchema>;

export default function NotificationsPage() {
  const [strategy, setStrategy] = useState<NotificationStrategyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { location: "", riskFactors: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setStrategy(null);
    try {
      const result = await getNotificationStrategy(data);
      setStrategy(result);
    } catch (e) {
      setError("Failed to get notification strategy. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Notification Strategy</h1>
        <p className="text-muted-foreground">Get a personalized notification strategy based on your location and health risks.</p>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Personalize Your Alerts</CardTitle>
          <CardDescription>Enter your location and any health risk factors to receive a tailored notification plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., London, UK" {...field} className="text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskFactors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Risk Factors</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Asthma, elderly, children" {...field} className="text-base" />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of factors (e.g., asthma, heart condition, age).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Strategy
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

      {strategy && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Your Custom Notification Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 whitespace-pre-wrap">{strategy.strategy}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
