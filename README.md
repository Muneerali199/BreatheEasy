# BreatheEasy: Your AI-Powered Air Quality Companion

<p align="center">
  <strong>A cutting-edge web application that provides real-time, hyperlocal air quality forecasts and analysis through a stunning, interactive interface.</strong>
</p>

<p align="center">
  <em>Stay ahead of air pollution, understand your environment, and protect your health with AI-driven insights.</em>
</p>

<p align="center">
  <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /></a>
  <a href="https://firebase.google.com/docs/genkit" target="_blank"><img src="https://img.shields.io/badge/Genkit-1A73E8?style=for-the-badge&logo=firebase&logoColor=white" /></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /></a>
  <a href="https://ui.shadcn.com/" target="_blank"><img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcn-ui&logoColor=white" /></a>
</p>

---

<!-- You can add a screenshot or GIF of the app here! -->
<p align="center">
  <img src="https://placehold.co/800x450.png" alt="BreatheEasy App Screenshot" data-ai-hint="dashboard weather app" />
</p>

## ✨ Core Features

BreatheEasy is packed with features designed to make complex environmental data accessible, understandable, and actionable.

-   **🌍 Stunning Interactive 3D Globe**: The app opens with a beautiful, interactive 3D globe, visualizing air quality data points across the world, set against a backdrop of a realistic starfield.
-   **👆 Seamless One-Tap Forecasts**: A powerful location search with instant autocomplete makes finding your city a breeze. Select a location to elegantly transition from the globe to a detailed dashboard with no extra steps.
-   **🤖 Comprehensive AI-Powered Dashboard**:
    -   **Dynamic AQI Card**: Instantly shows the current Air Quality Index (AQI) and dynamically changes color for an immediate visual assessment.
    -   **Intelligent Forecast Summary**: Genkit generates a detailed, human-readable forecast using Markdown for clarity.
    -   **Visual Pollutant Breakdown**: See a clear breakdown of primary pollutants (PM2.5, O3, NO2) with dedicated icons, progress bars, and color-coded badges.
    -   **30-Day Trend Chart**: An interactive area chart visualizes the forecasted AQI trend for the next 30 days.
-   **❤️ Personalized Health Recommendations**: Get actionable health advice tailored to the current conditions, with separate, collapsible sections for the **General Public** and **Sensitive Groups**.
-   **📈 Historical Data Analysis**: Explore past air quality trends for any location and custom date range, with an AI-generated summary of trends and patterns.
-   **🔔 Custom Notification Strategies**: Generate a personalized alert strategy based on your location and specific health risk factors.
-   **🎨 Modern, Responsive & Themeable UI**: Built with Next.js, ShadCN UI, and Tailwind CSS for a beautiful and responsive experience, including a polished dark mode.

## 🧠 How It Works: The AI Engine

The intelligence behind BreatheEasy is powered by **Genkit**, which orchestrates a multi-tool approach to generate highly accurate and contextual forecasts. This mimics how a real meteorologist works by combining data from different sources.

When you request a forecast, a Genkit flow is triggered that:

1.  **Calls the IQAir API**: It fetches real-time, ground-level sensor data for the specified location.
2.  **Simulates Satellite Data**: A mock tool simulates retrieving satellite imagery analysis (e.g., aerosol optical depth).
3.  **Integrates Weather Models**: Another mock tool simulates fetching weather data (e.g., wind patterns) crucial for prediction.
4.  **Synthesizes and Analyzes**: The Genkit flow feeds all this data into the Gemini model. The AI acts as an expert analyst, synthesizing the information to create a comprehensive forecast, trendlines, and health recommendations.
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

Here's a high-level overview of the key directories. For a complete breakdown, please see the `STRUCTURE.md` file in the root of the project.

-   `src/app/`: Contains all the pages of the application, following the Next.js App Router structure. The main dashboard, historical data page, and notifications page are located here.
-   `src/ai/`: Home to all Genkit-related logic. This includes AI flows for forecasting (`air-quality-forecast.ts`), historical analysis (`historical-air-quality.ts`), and notification strategies (`notification-strategy.ts`).
-   `src/components/`: Includes all reusable React components, organized by UI elements (`ui`), features (`globe`, `layout`), and icons.
-   `src/context/`: Contains React Context providers, such as the `ForecastProvider` for managing global state related to the air quality forecast.
-   `src/lib/`: Utility functions, like the `cn` function for merging Tailwind classes.
-   `public/`: Static assets like images or fonts would go here.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
