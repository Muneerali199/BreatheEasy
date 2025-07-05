'use client';

import type { ForecastAirQualityOutput } from '@/ai/flows/air-quality-forecast';
import React, { createContext, useState, useContext, type ReactNode } from 'react';

interface ForecastContextType {
  forecast: ForecastAirQualityOutput | null;
  setForecast: (forecast: ForecastAirQualityOutput | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  const [forecast, setForecast] = useState<ForecastAirQualityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ForecastContext.Provider value={{ forecast, setForecast, isLoading, setIsLoading }}>
      {children}
    </ForecastContext.Provider>
  );
};

export const useForecast = (): ForecastContextType => {
  const context = useContext(ForecastContext);
  if (!context) {
    throw new Error('useForecast must be used within a ForecastProvider');
  }
  return context;
};
