'use client';

import { useState, useEffect } from 'react';
import { getCurrentWeather } from '@/lib/weatherApi';
import WeatherDisplay from '@/components/WeatherDisplay';
import { WeatherData } from '@/types/weather';

export default function Home() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultCitiesWeather, setDefaultCitiesWeather] = useState<
    WeatherData[]
  >([]);
  const [defaultCitiesLoading, setDefaultCitiesLoading] = useState(true);
  const [defaultCitiesError, setDefaultCitiesError] = useState<string | null>(
    null
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCurrentWeather(city);
      setWeatherData(data);
    } catch {
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDefaultCitiesWeather = async () => {
      setDefaultCitiesLoading(true);
      setDefaultCitiesError(null);
      try {
        const [alexandriaWeather, dammamWeather] = await Promise.all([
          getCurrentWeather('Alexandria'),
          getCurrentWeather('Dammam'),
        ]);
        setDefaultCitiesWeather([alexandriaWeather, dammamWeather]);
      } catch {
        setDefaultCitiesError('Failed to fetch default cities weather data.');
      } finally {
        setDefaultCitiesLoading(false);
      }
    };

    fetchDefaultCitiesWeather();
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">
          Weather App
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-700"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <WeatherDisplay
          weatherData={weatherData}
          isLoading={isLoading}
          error={error}
        />

        {defaultCitiesLoading ? (
          <div className="text-center p-4">
            Loading default cities weather...
          </div>
        ) : defaultCitiesError ? (
          <div className="text-center text-red-500 p-4">
            {defaultCitiesError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultCitiesWeather.map((weather, index) => (
              <WeatherDisplay
                key={index}
                weatherData={weather}
                isLoading={false}
                error={null}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
