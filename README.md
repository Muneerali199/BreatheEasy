# BreatheEasy: AI-Powered Air Quality Visualizer

BreatheEasy is a modern, web-based application designed to provide real-time and forecasted air quality information through an intuitive and visually rich interface. Leveraging the power of AI, it offers detailed insights, health recommendations, and historical data analysis to help users stay informed about the air they breathe.

## ✨ Core Features

-   **Interactive 3D Globe**: A stunning, interactive 3D globe visualizes air quality data points across the world, with colors dynamically changing based on the current forecast.
-   **Real-time AI Forecasts**: Get instant air quality forecasts for any supported location, powered by Genkit and real-world data from the IQAir API.
-   **AI-Powered Analysis**: The application uses AI to generate human-readable forecast summaries and health recommendations tailored to the current conditions.
-   **Location Autocomplete**: A sleek, searchable input field makes finding and selecting a location fast and user-friendly.
-   **Historical Data Analysis**: View past air quality trends with an interactive chart and receive an AI-generated summary of historical patterns for any location and date range.
-   **Personalized Notification Strategies**: Generate custom alert strategies based on your location and specific health risk factors.
-   **Beautiful, Responsive UI**: A modern interface built with ShadCN UI and Tailwind CSS, complete with a beautiful dark mode.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
-   **3D Visualization**: [Three.js](https://threejs.org/)
-   **Charting**: [Recharts](https://recharts.org/)
-   **State Management**: React Context

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later recommended)
-   `npm` or `yarn` package manager

### Environment Variables

This project requires an API key from IQAir to fetch real-time air quality data.

1.  Sign up for a free API key on the [IQAir website](https://www.iqair.com/commercial/air-quality-monitors/airvisual-platform/api).
2.  Create a `.env` file in the root of the project.
3.  Add your API key to the `.env` file:

    ```bash
    IQAIR_API_KEY=your_api_key_here
    ```

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd BreatheEasy
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

To run the development server, which includes both the Next.js app and the Genkit flows:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📜 Available Scripts

-   `npm run dev`: Starts the Next.js development server with Turbopack.
-   `npm run genkit:dev`: Starts the Genkit flows in a separate development server (this is handled automatically by `npm run dev` in this setup).
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server after building.
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

## 📂 Project Structure

Here's a high-level overview of the key directories:

-   `src/app/`: Contains all the pages of the application, following the Next.js App Router structure.
-   `src/ai/`: Home to all Genkit-related logic, including AI flows for forecasting, historical analysis, and notification strategies.
-   `src/components/`: Includes all reusable React components, organized by UI elements and features (e.g., `globe`, `layout`, `icons`).
-   `src/context/`: Contains React Context providers, such as the `ForecastProvider` for managing global state.
-   `src/lib/`: Utility functions.
-   `public/`: Static assets.

