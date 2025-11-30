'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

export default function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setWeather(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="z-10 max-w-md md:max-w-3xl w-full items-center justify-between font-mono text-sm">

        <div className="glass rounded-3xl p-8 w-full">
          <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
            Weather Forecast
          </h1>

          <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name (e.g., Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-glass w-full rounded-xl px-4 py-3 text-lg text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Searching...' : 'Get Weather'}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-center animate-pulse">
              {error}
            </div>
          )}

          {weather && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-4xl font-bold mb-2">{weather.name}, {weather.sys.country}</h2>
                <p className="text-blue-200 capitalize text-lg">{weather.weather[0].description}</p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-white/20 shadow-inner bg-white/10">
                  {(() => {
                    const main = weather.weather[0].main;

                    // Sprite grid assumption: 3 columns x 4 rows
                    // We scale the inner container to 300% width and 400% height
                    // Default: Clouds (Center column, 2nd row) -> left: -100%, top: -100%
                    let x = '-100%';
                    let y = '-100%';

                    if (main === 'Clear') {
                      // Sun (Left column, 2nd row)
                      x = '0%';
                      y = '-100%';
                    } else if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) {
                      // Umbrella (Right column, 1st row)
                      x = '-200%';
                      y = '0%';
                    }

                    return (
                      <div
                        className="absolute w-[300%] h-[400%] left-0 top-0 transition-transform duration-500 ease-out"
                        style={{ transform: `translate(${x}, ${y})` }}
                      >
                        <Image
                          src="/weather-sprites.png"
                          alt={weather.weather[0].description}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    );
                  })()}
                </div>
                <div className="text-6xl font-bold ml-6">
                  {Math.round(weather.main.temp)}°
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-blue-200 mb-1">湿度</p>
                  <p className="text-xl font-semibold">{weather.main.humidity}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-blue-200 mb-1">風速</p>
                  <p className="text-xl font-semibold">{weather.wind.speed} m/s</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-blue-200 mb-1">体感温度</p>
                  <p className="text-xl font-semibold">{Math.round(weather.main.feels_like)}°</p>
                </div>
              </div>


            </div>
          )}
        </div>

        <div className="mt-8 text-center text-white/40 text-xs">
          Powered by OpenWeatherMap & Next.js
        </div>
      </div>
    </main>
  );
}
