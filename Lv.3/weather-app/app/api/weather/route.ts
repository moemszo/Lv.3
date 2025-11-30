import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
        return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    // For demo purposes, if no key is found, we might want to return a mock response or a specific error.
    if (!apiKey) {
        console.error("API key missing. Please set OPENWEATHER_API_KEY in .env.local or Vercel Environment Variables.");
        return NextResponse.json({
            error: 'Configuration Error: API Key is missing. Please set OPENWEATHER_API_KEY in your Vercel project settings.'
        }, { status: 500 });
    }

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ja`
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to fetch weather data' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Weather fetch error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
