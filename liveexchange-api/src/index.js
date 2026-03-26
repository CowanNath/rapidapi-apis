/**
 * LiveExchange API - Real-time currency exchange rates
 * Data source: ExchangeRate-API (Free tier available)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host',
      'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route: GET /rates - Get all rates for a base currency
      if (path === '/rates' && request.method === 'GET') {
        return await getRates(url, corsHeaders);
      }
      
      // Route: GET /convert - Convert currency
      if (path === '/convert' && request.method === 'GET') {
        return await convertCurrency(url, corsHeaders);
      }
      
      // Route: GET /currencies - List supported currencies
      if (path === '/currencies' && request.method === 'GET') {
        return await listCurrencies(corsHeaders);
      }
      
      // Route: GET /pair - Get rate for a currency pair
      if (path === '/pair' && request.method === 'GET') {
        return await getPairRate(url, corsHeaders);
      }
      
      // Route: GET / - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'LiveExchange API',
          version: '1.0.0',
          description: 'Real-time currency exchange rates',
          endpoints: [
            { path: '/rates', method: 'GET', params: 'base', description: 'Get all exchange rates for base currency' },
            { path: '/convert', method: 'GET', params: 'from, to, amount', description: 'Convert currency' },
            { path: '/pair', method: 'GET', params: 'from, to', description: 'Get rate for currency pair' },
            { path: '/currencies', method: 'GET', params: 'none', description: 'List supported currencies' }
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

// Cache for exchange rates (updated daily from open.er-api.com)
const CURRENCY_NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc', HKD: 'Hong Kong Dollar', SGD: 'Singapore Dollar',
  SEK: 'Swedish Krona', KRW: 'South Korean Won', INR: 'Indian Rupee',
  BRL: 'Brazilian Real', MXN: 'Mexican Peso', RUB: 'Russian Ruble',
  ZAR: 'South African Rand', TRY: 'Turkish Lira', THB: 'Thai Baht',
  IDR: 'Indonesian Rupiah', MYR: 'Malaysian Ringgit', PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong', TWD: 'Taiwan Dollar', AED: 'UAE Dirham',
  SAR: 'Saudi Riyal', NZD: 'New Zealand Dollar', DKK: 'Danish Krone',
  NOK: 'Norwegian Krone', PLN: 'Polish Zloty', CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint', ILS: 'Israeli Shekel', CLP: 'Chilean Peso',
  EGP: 'Egyptian Pound', PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka',
  NGN: 'Nigerian Naira', UAH: 'Ukrainian Hryvnia'
};

/**
 * Get all exchange rates for a base currency
 */
async function getRates(url, corsHeaders) {
  const base = (url.searchParams.get('base') || 'USD').toUpperCase();
  
  // Use free ExchangeRate-API
  const apiUrl = `https://open.er-api.com/v6/latest/${base}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.result === 'error') {
    return new Response(JSON.stringify({ error: 'Invalid currency code' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  return new Response(JSON.stringify({
    base: data.base_code,
    rates: data.rates,
    last_updated: data.time_last_update_utc,
    next_update: data.time_next_update_utc
  }), { headers: corsHeaders });
}

/**
 * Convert currency
 */
async function convertCurrency(url, corsHeaders) {
  const from = (url.searchParams.get('from') || 'USD').toUpperCase();
  const to = (url.searchParams.get('to') || 'EUR').toUpperCase();
  const amount = parseFloat(url.searchParams.get('amount')) || 1;
  
  const apiUrl = `https://open.er-api.com/v6/latest/${from}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.result === 'error') {
    return new Response(JSON.stringify({ error: 'Invalid currency code' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  const rate = data.rates[to];
  if (!rate) {
    return new Response(JSON.stringify({ error: 'Target currency not supported' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  const result = amount * rate;
  
  return new Response(JSON.stringify({
    from,
    to,
    amount,
    rate,
    result,
    last_updated: data.time_last_update_utc
  }), { headers: corsHeaders });
}

/**
 * Get rate for a currency pair
 */
async function getPairRate(url, corsHeaders) {
  const from = (url.searchParams.get('from') || 'USD').toUpperCase();
  const to = (url.searchParams.get('to') || 'EUR').toUpperCase();
  
  const apiUrl = `https://open.er-api.com/v6/latest/${from}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.result === 'error') {
    return new Response(JSON.stringify({ error: 'Invalid currency code' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  const rate = data.rates[to];
  if (!rate) {
    return new Response(JSON.stringify({ error: 'Target currency not supported' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
  
  return new Response(JSON.stringify({
    pair: `${from}/${to}`,
    rate,
    from_name: CURRENCY_NAMES[from] || from,
    to_name: CURRENCY_NAMES[to] || to,
    last_updated: data.time_last_update_utc
  }), { headers: corsHeaders });
}

/**
 * List supported currencies
 */
async function listCurrencies(corsHeaders) {
  return new Response(JSON.stringify({
    count: Object.keys(CURRENCY_NAMES).length,
    currencies: CURRENCY_NAMES
  }), { headers: corsHeaders });
}
