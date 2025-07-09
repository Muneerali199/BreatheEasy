# BreatheEasy: Your AI-Powered Air Quality Companion

<p align="center">
  <strong>A cutting-edge web application that provides real-time, hyperlocal air quality forecasts and analysis through a stunning, interactive interface.</strong>
</p>

<p align="center">
  <em>Stay ahead of air pollution, understand your environment, and protect your health with AI-driven insights.</em>
</p>

---

<!-- You can add a screenshot or GIF of the app here! -->
<p align="center">
  <img src="https://placehold.co/800x450.png" alt="BreatheEasy App Screenshot" data-ai-hint="dashboard weather app" />
</p>

## ✨ Core Features

BreatheEasy is packed with features designed to make complex environmental data accessible, understandable, and actionable.

-   **Stunning Interactive 3D Globe**:
    -   The app opens with a beautiful, interactive 3D globe, visualizing air quality data points across the world.
    -   Explore the globe with zoom and rotation, set against a backdrop of a realistic starfield.
    -   Get a high-level, color-coded overview of global air quality before diving into specifics.

-   **Seamless One-Tap Forecasts**:
    -   A powerful location search with instant autocomplete suggestions makes finding your city a breeze.
    -   Select a location with a single tap or click to elegantly transition from the globe to a detailed dashboard. No extra steps required.

-   **Comprehensive AI-Powered Dashboard**:
    -   **Dynamic AQI Card**: The main header card instantly shows the current Air Quality Index (AQI) and dynamically changes color (green, yellow, red) for an immediate visual assessment.
    -   **Intelligent Forecast Summary**: Genkit generates a detailed, human-readable forecast summary using Markdown for clarity, explaining what to expect and why.
    -   **Visual Pollutant Breakdown**: Instead of just numbers, see a clear breakdown of primary pollutants (PM2.5, O3, NO2) with dedicated icons, progress bars, and color-coded AQI badges.
    -   **30-Day Trend Chart**: An interactive area chart visualizes the forecasted AQI trend for the next 30 days, helping you plan ahead.

-   **Personalized Health Recommendations**:
    -   The AI provides actionable health advice tailored to the current conditions.
    -   Separate, collapsible sections offer specific recommendations for both the **General Public** and **Sensitive Groups** (like children, the elderly, and those with respiratory issues).

-   **Historical Data Analysis**:
    -   Navigate to a dedicated page to explore past air quality trends for any location and custom date range.
    -   The AI analyzes the historical data to generate a summary of trends, patterns, and potential causes for fluctuations.

-   **Custom Notification Strategies**:
    -   Generate a personalized alert strategy based on your location and specific health risk factors (e.g., asthma, heart conditions).
    -   The AI provides clear, structured advice on when to take precautions based on different AQI thresholds.

-   **Modern, Responsive & Themeable UI**:
    -   Built with Next.js, ShadCN UI, and Tailwind CSS for a beautiful and responsive experience on any device.
    -   Includes a polished dark mode that can be toggled manually or set to follow your system's theme.

## 🧠 How It Works: The AI Engine

The intelligence behind BreatheEasy is powered by **Genkit**, which orchestrates a multi-tool approach to generate highly accurate and contextual forecasts.

When you request a forecast, a Genkit flow is triggered that:

1.  **Calls the IQAir API**: It fetches real-time, ground-level sensor data for the specified location. This provides the most accurate baseline for current conditions.
2.  **Simulates Satellite Data**: A mock tool simulates retrieving satellite imagery analysis, considering factors like aerosol optical depth and cloud cover.
3.  **Integrates Weather Models**: Another mock tool simulates fetching weather data like wind speed, wind direction, and precipitation, which are crucial for predicting how air quality will change.
4.  **Synthesizes and Analyzes**: The Genkit flow feeds all this data into the Gemini model. The AI then synthesizes the information from all three sources to create a comprehensive forecast, a 30-day trendline, and detailed health recommendations.
5.  **Handles Errors Gracefully**: The flow includes a built-in retry mechanism to handle temporary service overloads, ensuring a more resilient user experience.

This multi-faceted approach allows BreatheEasy to provide a forecast that is more than just a single data point—it's a holistic analysis of the environmental conditions.

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
