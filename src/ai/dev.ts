import { config } from 'dotenv';
config();

import '@/ai/flows/air-quality-forecast.ts';
import '@/ai/flows/notification-strategy.ts';
import '@/ai/flows/historical-air-quality.ts';
