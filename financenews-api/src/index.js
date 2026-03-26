/**
 * FinanceNews API - Latest financial and business news
 * Data source: RSS feeds from major financial news outlets
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Host',
      'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route: GET /latest - Latest financial news
      if (path === '/latest' && request.method === 'GET') {
        return await getLatestNews(url, corsHeaders);
      }
      
      // Route: GET /search - Search news
      if (path === '/search' && request.method === 'GET') {
        return await searchNews(url, corsHeaders);
      }
      
      // Route: GET /markets - Market overview
      if (path === '/markets' && request.method === 'GET') {
        return await getMarketOverview(corsHeaders);
      }
      
      // Route: GET /crypto - Crypto news
      if (path === '/crypto' && request.method === 'GET') {
        return await getCryptoNews(corsHeaders);
      }
      
      // Route: GET /sources - List news sources
      if (path === '/sources' && request.method === 'GET') {
        return await listSources(corsHeaders);
      }
      
      // Route: GET / - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'FinanceNews API',
          version: '1.0.0',
          description: 'Latest financial and business news from multiple sources',
          endpoints: [
            { path: '/latest', method: 'GET', params: 'limit, source', description: 'Get latest financial news' },
            { path: '/search', method: 'GET', params: 'q, limit', description: 'Search financial news' },
            { path: '/markets', method: 'GET', params: 'none', description: 'Get market overview' },
            { path: '/crypto', method: 'GET', params: 'limit', description: 'Get crypto news' },
            { path: '/sources', method: 'GET', params: 'none', description: 'List available sources' }
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

const RSS_SOURCES = {
  'cnbc': {
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'general'
  },
  'reuters-business': {
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
    category: 'business'
  },
  'marketwatch': {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    category: 'markets'
  },
  'wsj': {
    name: 'Wall Street Journal',
    url: 'https://feeds.a.wsj.com/rss/RSSMarketsMain.xml',
    category: 'markets'
  },
  'ft': {
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    category: 'general'
  }
};

/**
 * Parse RSS XML feed
 */
async function parseRSS(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }
  
  const text = await response.text();
  const items = [];
  
  // Simple XML parser for RSS/Atom feeds
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(text)) !== null) {
    const itemContent = match[1];
    const item = {};
    
    const titleMatch = itemContent.match(/<title>(?:<![CDATA\[)?([\s\S]*?)(?:\]\]>)*<\/title>/i);
    const linkMatch = itemContent.match(/<link>(?:<![CDATA\[)?([\s\S]*?)(?:\]\]>)*<\/link>/i);
    const descMatch = itemContent.match(/<description>(?:<![CDATA\[)?([\s\S]*?)(?:\]\]>)*<\/description>/i);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    
    if (titleMatch) item.title = titleMatch[1].trim();
    if (linkMatch) item.url = linkMatch[1].trim();
    if (descMatch) item.description = descMatch[1].trim().replace(/<[^>]*>/g, '');
    if (pubDateMatch) item.published_at = pubDateMatch[1].trim();
    
    if (item.title && item.url) {
      items.push(item);
    }
  }
  
  return items;
}

/**
 * Get latest financial news
 */
async function getLatestNews(url, corsHeaders) {
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const source = url.searchParams.get('source');
  
  let allNews = [];
  
  const sourcesToFetch = source && RSS_SOURCES[source] 
    ? { [source]: RSS_SOURCES[source] } 
    : RSS_SOURCES;
  
  for (const [key, src] of Object.entries(sourcesToFetch)) {
    try {
      const items = await parseRSS(src.url);
      allNews = allNews.concat(items.map(item => ({
        ...item,
        source: src.name,
        category: src.category
      })));
    } catch (e) {
      // Skip failed sources
    }
  }
  
  // Sort by date and limit
  allNews.sort((a, b) => {
    const dateA = new Date(a.published_at || 0);
    const dateB = new Date(b.published_at || 0);
    return dateB - dateA;
  });
  
  return new Response(JSON.stringify({
    count: allNews.length,
    news: allNews.slice(0, limit),
    fetched_at: new Date().toISOString()
  }), { headers: corsHeaders });
}

/**
 * Search news
 */
async function searchNews(url, corsHeaders) {
  const query = (url.searchParams.get('q') || '').toLowerCase();
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  
  if (!query) {
    return new Response(JSON.stringify({ 
      error: 'Please provide q parameter for search query' 
    }), { status: 400, headers: corsHeaders });
  }
  
  let allNews = [];
  
  for (const [key, src] of Object.entries(RSS_SOURCES)) {
    try {
      const items = await parseRSS(src.url);
      allNews = allNews.concat(items.map(item => ({
        ...item,
        source: src.name,
        category: src.category
      })));
    } catch (e) {
      // Skip failed sources
    }
  }
  
  // Filter by query
  const filtered = allNews.filter(item => 
    (item.title && item.title.toLowerCase().includes(query)) ||
    (item.description && item.description.toLowerCase().includes(query))
  );
  
  return new Response(JSON.stringify({
    query,
    count: filtered.length,
    news: filtered.slice(0, limit),
    fetched_at: new Date().toISOString()
  }), { headers: corsHeaders });
}

/**
 * Get market overview (from free data sources)
 */
async function getMarketOverview(corsHeaders) {
  // Use ExchangeRate-API for major currency rates as proxy
  const apiUrl = 'https://open.er-api.com/v6/latest/USD';
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  return new Response(JSON.stringify({
    currencies: {
      EUR_USD: { name: 'EUR/USD', rate: (1 / data.rates.EUR).toFixed(4) },
      GBP_USD: { name: 'GBP/USD', rate: (1 / data.rates.GBP).toFixed(4) },
      USD_JPY: { name: 'USD/JPY', rate: data.rates.JPY.toFixed(2) },
      USD_CNY: { name: 'USD/CNY', rate: data.rates.CNY.toFixed(4) },
      AUD_USD: { name: 'AUD/USD', rate: (1 / data.rates.AUD).toFixed(4) },
      USD_CHF: { name: 'USD/CHF', rate: data.rates.CHF.toFixed(4) }
    },
    last_updated: data.time_last_update_utc,
    note: 'Currency rates from ExchangeRate-API. For real-time stock data, consider upgrading to premium plan.'
  }), { headers: corsHeaders });
}

/**
 * Get crypto news
 */
async function getCryptoNews(corsHeaders) {
  // CoinDesk RSS
  try {
    const items = await parseRSS('https://www.coindesk.com/arc/outboundfeeds/rss/');
    
    return new Response(JSON.stringify({
      count: items.length,
      news: items.slice(0, 10).map(item => ({
        ...item,
        source: 'CoinDesk',
        category: 'crypto'
      })),
      fetched_at: new Date().toISOString()
    }), { headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch crypto news',
      message: e.message
    }), { status: 500, headers: corsHeaders });
  }
}

/**
 * List available sources
 */
async function listSources(corsHeaders) {
  const sources = Object.entries(RSS_SOURCES).map(([key, val]) => ({
    id: key,
    name: val.name,
    category: val.category
  }));
  
  return new Response(JSON.stringify({
    count: sources.length,
    sources
  }), { headers: corsHeaders });
}
