import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Globe from '@/components/globe/globe';
import { ForecastProvider } from '@/context/ForecastContext';

export const metadata: Metadata = {
  title: 'BreatheEasy',
  description: 'Air Quality Visualizer and Forecast App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-body antialiased')}
      >
        <ForecastProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">
              <div className="flex h-[calc(100vh-4rem)]">
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                  {children}
                </main>
                <aside className="hidden lg:flex w-[35%] xl:w-[40%] items-center justify-center border-l border-border bg-muted/20">
                  <Globe />
                </aside>
              </div>
            </div>
          </div>
          <Toaster />
        </ForecastProvider>
      </body>
    </html>
  );
}
