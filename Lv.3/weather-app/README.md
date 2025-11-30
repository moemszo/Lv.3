# Weather App

A modern, glassmorphism-styled weather application built with Next.js and Tailwind CSS.

## Features

- **Search**: Find weather by city name.
- **API Integration**: Fetches data from OpenWeatherMap via a secure server-side API route.
- **Responsive Design**: Looks great on mobile and desktop.
- **Glassmorphism UI**: Modern aesthetic with blurred backgrounds and gradients.

## Setup

1.  **Get an API Key**:
    -   Sign up at [OpenWeatherMap](https://openweathermap.org/).
    -   Get your free API key.

2.  **Configure Environment**:
    -   Create a file named `.env.local` in the root directory.
    -   Add your API key:
        ```env
        OPENWEATHER_API_KEY=your_api_key_here
        ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment
This app is ready to be deployed on Vercel.

### Vercel Deployment Steps
1.  Push your code to a GitHub repository.
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Important**: In the **"Environment Variables"** section:
    *   Key: `OPENWEATHER_API_KEY`
    *   Value: Your OpenWeatherMap API Key (starts with `...`)
5.  Click **"Deploy"**.

If you see a `500` error or "Configuration Error", please check if the Environment Variable is set correctly.
