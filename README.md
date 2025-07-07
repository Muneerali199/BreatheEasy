
# BreatheEasy: AI-Powered Air Quality Visualizer

BreatheEasy is a modern, web-based application designed to provide real-time and forecasted air quality information through an intuitive and visually rich interface. Leveraging the power of AI, it offers detailed insights, health recommendations, and historical data analysis to help users stay informed about the air they breathe.

<!-- You can add a screenshot or GIF of the app here! -->
<!-- ![BreatheEasy App Screenshot](path/to/your/screenshot.png) -->

## ✨ Core Features

-   **Interactive 3D Globe & Dashboard**: The application opens with a stunning, interactive 3D globe that visualizes air quality data points across the world. After selecting a location, the view elegantly transitions to a detailed dashboard.
-   **Real-time AI Forecasts**: Get instant air quality forecasts for any supported location. This feature is powered by Genkit, which uses a multi-tool approach to synthesize data from real-world ground sensors (via the IQAir API), simulated satellite imagery, and weather models.
-   **AI-Powered Analysis**: The application uses AI to generate human-readable forecast summaries and health recommendations tailored to the current conditions for both the general public and sensitive groups.
-   **Detailed Data Visualization**: The dashboard includes a 30-day AQI forecast trend chart and a visual breakdown of primary pollutants, each with a color-coded progress bar that makes understanding the data effortless.
-   **Location Autocomplete**: A sleek, searchable input field provides instant location suggestions as you type, making it fast and user-friendly to find and select a location.
-   **Historical Data Analysis**: A dedicated page allows users to view past air quality trends for any location and date range with an interactive chart. It also provides an AI-generated summary of historical patterns.
-   **Personalized Notification Strategies**: Users can generate custom alert strategies based on their location and specific health risk factors, like asthma or age.
-   **Beautiful, Responsive UI**: A modern interface built with Next.js, ShadCN UI, and Tailwind CSS, complete with a beautiful, themeable dark mode toggle.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with Gemini
-   **3D Visualization**: [Three.js](https://threejs.org/)
-   **Charting**: [Recharts](https://recharts.org/)
-   **State Management**: React Context & React Hook Form

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later recommended)
-   `npm` or `yarn` package manager

### Environment Variables

This project requires a **free API key from IQAir** to fetch real-time air quality data. Without it, the core forecasting feature will not work.

1.  Sign up for a free API key on the [IQAir website](https://www.iqair.com/commercial/air-quality-monitors/airvisual-platform/api).
2.  Create a file named `.env` in the root of the project.
3.  Add your API key to the `.env` file like this:

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

-   `npm run dev`: Starts the Next.js development server with Turbopack and the Genkit development server concurrently.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server after building.
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

## 📂 Project Structure

Here's a high-level overview of the key directories:

-   `src/app/`: Contains all the pages of the application, following the Next.js App Router structure. The main dashboard, historical data page, and notifications page are located here.
-   `src/ai/`: Home to all Genkit-related logic. This includes AI flows for forecasting (`air-quality-forecast.ts`), historical analysis (`historical-air-quality.ts`), and notification strategies (`notification-strategy.ts`).
-   `src/components/`: Includes all reusable React components, organized by UI elements (`ui`), features (`globe`, `layout`), and icons.
-   `src/context/`: Contains React Context providers, such as the `ForecastProvider` for managing global state related to the air quality forecast.
-   `src/lib/`: Utility functions, like the `cn` function for merging Tailwind classes.
-   `public/`: Static assets like images or fonts would go here.
