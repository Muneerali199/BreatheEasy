# Project Structure

This document provides a high-level overview of the key directories and files in the BreatheEasy project. Understanding this structure is essential for navigating the codebase and making contributions.

## Root Directory

-   `.env`: Stores environment variables, such as API keys. This file is not committed to version control.
-   `apphosting.yaml`: Configuration file for Firebase App Hosting.
-   `components.json`: Configuration for `shadcn/ui` components.
-   `next.config.ts`: Configuration file for the Next.js framework.
-   `package.json`: Defines project metadata, dependencies, and scripts.
-   `README.md`: The main documentation file for the project.
-   `tailwind.config.ts`: Configuration file for Tailwind CSS.
-   `tsconfig.json`: The configuration file for the TypeScript compiler.

## `src/` Directory

The `src` directory contains all of the application's source code.

### `src/app/`

This directory follows the Next.js App Router structure, where each sub-folder represents a route segment.

-   `page.tsx`: The main dashboard page, featuring the 3D globe and the primary forecast interface.
-   `historical/page.tsx`: The page for analyzing historical air quality data.
-   `notifications/page.tsx`: The page for generating personalized notification strategies.
-   `layout.tsx`: The root layout for the entire application. It includes the main header, theme provider, and context providers.
-   `globals.css`: Global stylesheets, Tailwind CSS directives, and theme variables for light and dark modes.
-   `actions.ts`: Server Actions used by client components, such as fetching location suggestions.

### `src/ai/`

This is the heart of the application's intelligence, containing all Genkit-related logic.

-   `genkit.ts`: Initializes and configures the main Genkit `ai` instance, including plugins like Google AI.
-   `dev.ts`: The entry point for the Genkit development server, which imports all the necessary flows.
-   `flows/`: A directory containing all the individual Genkit flows.
    -   `air-quality-forecast.ts`: The core AI flow that uses multiple tools (IQAir API, mock satellite data, mock weather data) to generate a comprehensive forecast.
    -   `historical-air-quality.ts`: The flow responsible for fetching and analyzing historical air quality data for a given location and date range.
    -   `notification-strategy.ts`: The flow that generates personalized notification strategies based on user-provided risk factors.

### `src/components/`

This directory houses all reusable React components.

-   `ui/`: Contains all the pre-built UI components from `shadcn/ui`, such as `Button`, `Card`, and `Input`.
-   `globe/`:
    -   `globe.tsx`: The sophisticated 3D interactive globe component built with Three.js.
-   `icons/`: Custom SVG icon components used throughout the app (e.g., `GoodAirIcon`, `ModerateAirIcon`).
-   `layout/`: Components related to the overall page structure.
    -   `header.tsx`: The main application header with navigation links.
    -   `theme-toggle.tsx`: The component for switching between light and dark modes.
-   `theme-provider.tsx`: The provider component from `next-themes` that enables theme switching.

### `src/context/`

Contains React Context providers for managing global state across the application.

-   `ForecastContext.tsx`: Manages the state for the air quality forecast, including the forecast data, loading status, and any errors. This allows different components to share and react to the same forecast data.

### `src/hooks/`

This directory is for custom React hooks that encapsulate reusable logic.

-   `use-mobile.tsx`: A hook to detect if the application is being viewed on a mobile device.
-   `use-toast.ts`: A hook for programmatically displaying toast notifications.

### `src/lib/`

A collection of utility functions used throughout the project.

-   `utils.ts`: Contains the `cn` function, a helper for conditionally merging Tailwind CSS classes.
