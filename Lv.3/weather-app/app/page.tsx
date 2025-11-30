'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';

type SearchHistory = Database['public']['Tables']['search_history']['Row'];
type Favorite = Database['public']['Tables']['favorites']['Row'];

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
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const supabase = createClient();

  // Fetch history and favorites on load
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch History
        const { data: historyData } = await supabase
          .from('search_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (historyData) {
          const uniqueHistory = historyData.reduce((acc, current) => {
            const exists = acc.find((item: SearchHistory) => {
              if (item.city_id && current.city_id) {
                return item.city_id === current.city_id;
              }
              return item.city === current.city;
            });
            if (!exists) return acc.concat([current]);
            return acc;
          }, [] as SearchHistory[]).slice(0, 10);
          setHistory(uniqueHistory);
        }

        // Fetch Favorites
        const { data: favData } = await supabase
          .from('favorites')
          .select('*')
          .order('created_at', { ascending: false });
        if (favData) setFavorites(favData);
      }
    };
    fetchData();
  }, [supabase]);

  const handleSearch = async (e: FormEvent | null, cityToSearch = city) => {
    if (e) e.preventDefault();
    if (!cityToSearch.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);
    setActiveTab('search'); // Switch to search tab
    if (cityToSearch !== city) setCity(cityToSearch);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityToSearch)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setWeather(data);

      // Save to history if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cityName = data.name;
        const cityId = data.id;

        // Delete existing entry (check by ID if possible, otherwise Name)
        if (cityId) {
          await supabase
            .from('search_history')
            .delete()
            .eq('user_id', user.id)
            .eq('city_id', cityId);
        } else {
          await supabase
            .from('search_history')
            .delete()
            .eq('user_id', user.id)
            .eq('city', cityName);
        }

        await supabase.from('search_history').insert({
          city: cityName,
          city_id: cityId,
          user_id: user.id
        });

        // Refresh history
        const { data: rawHistory } = await supabase
          .from('search_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (rawHistory) {
          // Deduplicate by city_id (preferred) or city name
          const uniqueHistory = rawHistory.reduce((acc, current) => {
            const exists = acc.find((item: SearchHistory) => {
              if (item.city_id && current.city_id) {
                return item.city_id === current.city_id;
              }
              return item.city === current.city;
            });

            if (!exists) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, [] as SearchHistory[]).slice(0, 10);

          setHistory(uniqueHistory);
        }
      }

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

  const toggleFavorite = async () => {
    if (!weather) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    const isFav = favorites.some(f => f.city === weather.name);

    if (isFav) {
      // Remove
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('city', weather.name);

      if (!error) {
        setFavorites(prev => prev.filter(f => f.city !== weather.name));
      }
    } else {
      // Add
      const { data, error } = await supabase
        .from('favorites')
        .insert({ city: weather.name, user_id: user.id })
        .select()
        .single();

      if (!error && data) {
        setFavorites(prev => [data, ...prev]);
      }
    }
  };

  const isCurrentCityFavorite = weather ? favorites.some(f => f.city === weather.name) : false;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="z-10 max-w-md md:max-w-3xl w-full items-center justify-between font-mono text-sm">

        <div className="glass rounded-3xl p-8 w-full min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                Weather Forecast
              </h1>
              <button
                onClick={() => setActiveTab(activeTab === 'search' ? 'favorites' : 'search')}
                className={`text-2xl transition-all hover:scale-110 ${activeTab === 'favorites' ? 'text-yellow-400' : 'text-white/30 hover:text-yellow-200'}`}
                title="View Favorites"
              >
                ★
              </button>
            </div>
            <a href="/account" className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors">
              Login / Dashboard
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`text-lg font-semibold transition-colors ${activeTab === 'search' ? 'text-white border-b-2 border-blue-400' : 'text-white/50 hover:text-white'}`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`text-lg font-semibold transition-colors ${activeTab === 'favorites' ? 'text-white border-b-2 border-blue-400' : 'text-white/50 hover:text-white'}`}
            >
              Favorites List
            </button>
          </div>

          {activeTab === 'search' ? (
            <>
              <form onSubmit={(e) => handleSearch(e)} className="flex flex-col gap-4 mb-8">
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

              {/* Search History */}
              {history.length > 0 && (
                <div className="mb-8">
                  <p className="text-blue-200 text-xs mb-2 uppercase tracking-wider">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearch(null, item.city)}
                        className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-white/5"
                      >
                        {item.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-center animate-pulse">
                  {error}
                </div>
              )}

              {weather && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl font-bold mb-2">{weather.name}, {weather.sys.country}</h2>
                      <button
                        onClick={toggleFavorite}
                        className="text-3xl hover:scale-110 transition-transform focus:outline-none"
                        title={isCurrentCityFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isCurrentCityFavorite ? '★' : '☆'}
                      </button>
                    </div>
                    <p className="text-blue-200 capitalize text-lg">{weather.weather[0].description}</p>
                  </div>

                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-white/20 shadow-inner bg-white/10">
                      {(() => {
                        const main = weather.weather[0].main;
                        let x = '-100%';
                        let y = '-100%';

                        if (main === 'Clear') {
                          x = '0%';
                          y = '-100%';
                        } else if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) {
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
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold mb-4 text-white">Favorite Cities</h2>
              {favorites.length === 0 ? (
                <p className="text-white/50 text-center py-8">No favorites yet. Star a city to see it here!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((fav) => (
                    <button
                      key={fav.id}
                      onClick={() => handleSearch(null, fav.city)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 text-left transition-all hover:scale-105 group"
                    >
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{fav.city}</h3>
                      <p className="text-white/40 text-sm mt-2">Click to view weather</p>
                    </button>
                  ))}
                </div>
              )}
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
