/**
 * QuickWeather API - Real-time weather data for any location
 * Data source: Open-Meteo (Free, no API key required)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host',
      'Content-Type': 'application/json'
    };
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route: GET /current - Current weather
      if (path === '/current' && request.method === 'GET') {
        return await getCurrentWeather(url, corsHeaders);
      }
      
      // Route: GET /forecast - Weather forecast
      if (path === '/forecast' && request.method === 'GET') {
        return await getForecast(url, corsHeaders);
      }
      
      // Route: GET /search - Search city
      if (path === '/search' && request.method === 'GET') {
        return await searchCity(url, corsHeaders);
      }
      
      // Route: GET / - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'QuickWeather API',
          version: '1.0.0',
          description: 'Real-time weather data for any location',
          endpoints: [
            { path: '/current', method: 'GET', params: 'lat, lon or city', description: 'Get current weather' },
            { path: '/forecast', method: 'GET', params: 'lat, lon or city, days', description: 'Get weather forecast' },
            { path: '/search', method: 'GET', params: 'q', description: 'Search for a city' }
          ]
        }), { headers: corsHeaders });
      }
      
      return new Response(JSON.stringify({ error: 'Not Found' }), { 
        status: 404, 
        headers: corsHeaders 
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

/**
 * Get coordinates from city name using Open-Meteo Geocoding
 */
async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(geoUrl);
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error('City not found');
  }
  
  return {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country
  };
}

/**
 * Get current weather
 */
async function getCurrentWeather(url, corsHeaders) {
  let lat = url.searchParams.get('lat');
  let lon = url.searchParams.get('lon');
  const city = url.searchParams.get('city');
  
  // If city provided, get coordinates
  if (city && (!lat || !lon)) {
    const coords = await getCoordinates(city);
    lat = coords.lat;
    lon = coords.lon;
  }
  
  if (!lat || !lon) {
    return new Response(JSON.stringify({ 
      error: 'Please provide lat and lon parameters, or city parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  // Fetch weather from Open-Meteo
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
  
  const response = await fetch(weatherUrl);
  const data = await response.json();
  
  const weatherCodeMap = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 95: 'Thunderstorm'
  };
  
  return new Response(JSON.stringify({
    location: city ? { name: city } : { lat, lon },
    current: {
      temperature: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      weather: weatherCodeMap[data.current.weather_code] || 'Unknown',
      weather_code: data.current.weather_code,
      wind_speed: data.current.wind_speed_10m,
      wind_direction: data.current.wind_direction_10m,
      precipitation: data.current.precipitation
    },
    units: {
      temperature: '°C',
      wind_speed: 'km/h',
      humidity: '%'
    },
    timestamp: new Date().toISOString()
  }), { headers: corsHeaders });
}

/**
 * Get weather forecast
 */
async function getForecast(url, corsHeaders) {
  let lat = url.searchParams.get('lat');
  let lon = url.searchParams.get('lon');
  const city = url.searchParams.get('city');
  const days = parseInt(url.searchParams.get('days')) || 7;
  
  if (city && (!lat || !lon)) {
    const coords = await getCoordinates(city);
    lat = coords.lat;
    lon = coords.lon;
  }
  
  if (!lat || !lon) {
    return new Response(JSON.stringify({ 
      error: 'Please provide lat and lon parameters, or city parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=${Math.min(days, 16)}`;
  
  const response = await fetch(weatherUrl);
  const data = await response.json();
  
  const forecast = data.daily.time.map((date, i) => ({
    date,
    temp_max: data.daily.temperature_2m_max[i],
    temp_min: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
    weather_code: data.daily.weather_code[i]
  }));
  
  return new Response(JSON.stringify({
    location: { lat, lon },
    forecast,
    units: { temperature: '°C', precipitation: 'mm' }
  }), { headers: corsHeaders });
}

/**
 * Search for a city
 */
async function searchCity(url, corsHeaders) {
  const query = url.searchParams.get('q');
  
  if (!query) {
    return new Response(JSON.stringify({ 
      error: 'Please provide q parameter for search query' 
    }), { status: 400, headers: corsHeaders });
  }
  
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10`;
  const response = await fetch(geoUrl);
  const data = await response.json();
  
  const cities = (data.results || []).map(city => ({
    name: city.name,
    country: city.country,
    region: city.admin1 || '',
    lat: city.latitude,
    lon: city.longitude,
    population: city.population || null
  }));
  
  return new Response(JSON.stringify({
    query,
    count: cities.length,
    cities
  }), { headers: corsHeaders });
}
