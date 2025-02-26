'use client';

import { useState, useEffect } from 'react';
import { getCurrentWeather } from '@/lib/weatherApi';
import WeatherDisplay from '@/components/WeatherDisplay';
import { WeatherData } from '@/types/weather';

const cityNameMapping: Record<string, string> = {
  'الإسكندرية': 'Alexandria',
  'الدمام': 'Dammam',
  'القاهرة': 'Cairo',
  'الرياض': 'Riyadh',
  'جدة': 'Jeddah',
  'مكة': 'Mecca',
  'المدينة': 'Medina',
  'الخبر': 'Khobar',
  'أبوظبي': 'Abu Dhabi',
  'دبي': 'Dubai',
  'الشارقة': 'Sharjah',
  'الدوحة': 'Doha',
  'المنامة': 'Manama',
  'مسقط': 'Muscat',
  'الكويت': 'Kuwait City',
  'عمان': 'Amman',
  'بيروت': 'Beirut',
  'بغداد': 'Baghdad',
  'دمشق': 'Damascus'
};

export default function Home() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultCitiesWeather, setDefaultCitiesWeather] = useState<WeatherData[]>([]);
  const [defaultCitiesLoading, setDefaultCitiesLoading] = useState(true);
  const [defaultCitiesError, setDefaultCitiesError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const searchCity = cityNameMapping[city.trim()] || city.trim();
      const data = await getCurrentWeather(searchCity);
      setWeatherData(data);
    } catch {
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCity(input);

    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const matchingSuggestions = Object.entries(cityNameMapping)
      .filter(([arabic, english]) => 
        arabic.toLowerCase().includes(input.toLowerCase()) ||
        english.toLowerCase().includes(input.toLowerCase())
      )
      .map(([arabic, english]) => `${english} (${arabic})`)
      .slice(0, 5);

    setSuggestions(matchingSuggestions);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const cityName = suggestion.split(' (')[0];
    setCity(cityName);
    setSuggestions([]);

    setIsLoading(true);
    setError(null);

    try {
      const searchCity = cityNameMapping[cityName.trim()] || cityName.trim();
      const data = await getCurrentWeather(searchCity);
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

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto relative">
          <div className="flex-1 relative">
            <input
              type="text"
              value={city}
              onChange={handleInputChange}
              placeholder="Enter city name..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
