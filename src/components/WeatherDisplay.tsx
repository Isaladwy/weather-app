'use client';

import { useState } from 'react';
import { WeatherData } from '@/types/weather';
import Image from 'next/image';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export default function WeatherDisplay({
  weatherData,
  isLoading,
  error,
}: WeatherDisplayProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  if (isLoading)
    return <div className="text-center p-4">Loading weather data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!weatherData) return null;

  const temperature =
    unit === 'C' ? weatherData.main.temp : (weatherData.main.temp * 9) / 5 + 32;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {weatherData.name}, {weatherData.sys.country}
        </h2>
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl font-bold">
            {Math.round(temperature)}°{unit}
          </span>
          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch to °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
        <div className="flex items-center justify-center mb-4">
          <Image
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            // className="w-16 h-16"
            width={16}
            height={16}
          />
          <span className="text-lg capitalize">
            {weatherData.weather[0].description}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              Feels like: {Math.round(weatherData.main.feels_like)}°{unit}
            </p>
            <p>Humidity: {weatherData.main.humidity}%</p>
          </div>
          <div>
            <p>Wind: {Math.round(weatherData.wind.speed)} m/s</p>
            <p>Pressure: {weatherData.main.pressure} hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
