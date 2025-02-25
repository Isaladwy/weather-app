import { WeatherData, ForecastData } from '@/types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';

async function getGeoLocation(city: string) {
  const response = await fetch(
    `${GEO_URL}/search?name=${encodeURIComponent(city)}&count=1`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch location data');
  }

  const data = await response.json();
  if (!data.results?.length) {
    throw new Error('City not found');
  }

  return data.results[0];
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  const location = await getGeoLocation(city);
  
  const response = await fetch(
    `${BASE_URL}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();
  
  // Map Open-Meteo response to WeatherData format
  return {
    weather: [{
      id: data.current.weather_code,
      main: getWeatherDescription(data.current.weather_code),
      description: getWeatherDescription(data.current.weather_code),
      icon: getWeatherIcon(data.current.weather_code)
    }],
    main: {
      temp: data.current.temperature_2m,
      feels_like: data.current.temperature_2m, // Open-Meteo doesn't provide feels_like
      temp_min: data.current.temperature_2m,
      temp_max: data.current.temperature_2m,
      pressure: data.current.pressure_msl,
      humidity: data.current.relative_humidity_2m
    },
    wind: {
      speed: data.current.wind_speed_10m,
      deg: 0 // Open-Meteo doesn't provide wind direction in free tier
    },
    name: location.name,
    sys: {
      country: location.country_code
    }
  };
}

// Helper function to map weather codes to descriptions
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherCodes[code] || 'Unknown';
}

// Helper function to map weather codes to icons
function getWeatherIcon(code: number): string {
  // Map weather codes to similar OpenWeather icons
  if (code === 0) return '01d'; // Clear sky
  if (code <= 2) return '02d'; // Partly cloudy
  if (code === 3) return '04d'; // Overcast
  if (code <= 48) return '50d'; // Fog
  if (code <= 55) return '09d'; // Drizzle
  if (code <= 65) return '10d'; // Rain
  if (code <= 77) return '13d'; // Snow
  if (code <= 82) return '09d'; // Rain showers
  if (code <= 86) return '13d'; // Snow showers
  return '11d'; // Thunderstorm
}

export async function getForecast(city: string): Promise<ForecastData> {
  const location = await getGeoLocation(city);
  
  const response = await fetch(
    `${BASE_URL}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code&forecast_days=5`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch forecast data');
  }

  const data = await response.json();
  
  // Map the first 40 hourly entries to match ForecastData format
  const list = data.hourly.time.slice(0, 40).map((time: string, index: number) => ({
    dt: new Date(time).getTime() / 1000,
    main: {
      temp: data.hourly.temperature_2m[index],
      feels_like: data.hourly.temperature_2m[index],
      temp_min: data.hourly.temperature_2m[index],
      temp_max: data.hourly.temperature_2m[index],
      pressure: data.hourly.pressure_msl[index],
      humidity: data.hourly.relative_humidity_2m[index]
    },
    weather: [{
      id: data.hourly.weather_code[index],
      main: getWeatherDescription(data.hourly.weather_code[index]),
      description: getWeatherDescription(data.hourly.weather_code[index]),
      icon: getWeatherIcon(data.hourly.weather_code[index])
    }],
    wind: {
      speed: data.hourly.wind_speed_10m[index],
      deg: 0
    },
    dt_txt: time
  }));

  return {
    list,
    city: {
      name: location.name,
      country: location.country_code
    }
  };
}
