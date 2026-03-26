/**
 * FastTranslate API - Fast translation service
 * Data source: MyMemory API (Free, no key required for basic usage)
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
      // Route: GET /translate - Translate text
      if (path === '/translate' && request.method === 'GET') {
        return await translate(url, corsHeaders);
      }
      
      // Route: POST /translate - Translate text (POST)
      if (path === '/translate' && request.method === 'POST') {
        return await translatePost(request, corsHeaders);
      }
      
      // Route: GET /languages - List supported languages
      if (path === '/languages' && request.method === 'GET') {
        return await listLanguages(corsHeaders);
      }
      
      // Route: GET /detect - Detect language
      if (path === '/detect' && request.method === 'GET') {
        return await detectLanguage(url, corsHeaders);
      }
      
      // Route: GET / - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'FastTranslate API',
          version: '1.0.0',
          description: 'Fast translation for 100+ languages',
          endpoints: [
            { path: '/translate', method: 'GET', params: 'text, to, from (optional)', description: 'Translate text' },
            { path: '/translate', method: 'POST', params: 'text, to, from (optional)', description: 'Translate text (POST)' },
            { path: '/languages', method: 'GET', params: 'none', description: 'List supported languages' },
            { path: '/detect', method: 'GET', params: 'text', description: 'Detect language of text' }
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

const LANGUAGES = {
  'af': 'Afrikaans', 'sq': 'Albanian', 'am': 'Amharic', 'ar': 'Arabic',
  'hy': 'Armenian', 'az': 'Azerbaijani', 'eu': 'Basque', 'be': 'Belarusian',
  'bn': 'Bengali', 'bs': 'Bosnian', 'bg': 'Bulgarian', 'ca': 'Catalan',
  'ceb': 'Cebuano', 'ny': 'Chichewa', 'zh': 'Chinese', 'zh-CN': 'Chinese Simplified',
  'zh-TW': 'Chinese Traditional', 'co': 'Corsican', 'hr': 'Croatian', 'cs': 'Czech',
  'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'eo': 'Esperanto',
  'et': 'Estonian', 'tl': 'Filipino', 'fi': 'Finnish', 'fr': 'French',
  'fy': 'Frisian', 'gl': 'Galician', 'ka': 'Georgian', 'de': 'German',
  'el': 'Greek', 'gu': 'Gujarati', 'ht': 'Haitian Creole', 'ha': 'Hausa',
  'haw': 'Hawaiian', 'he': 'Hebrew', 'hi': 'Hindi', 'hmn': 'Hmong',
  'hu': 'Hungarian', 'is': 'Icelandic', 'ig': 'Igbo', 'id': 'Indonesian',
  'ga': 'Irish', 'it': 'Italian', 'ja': 'Japanese', 'jw': 'Javanese',
  'kn': 'Kannada', 'kk': 'Kazakh', 'km': 'Khmer', 'ko': 'Korean',
  'ku': 'Kurdish', 'ky': 'Kyrgyz', 'lo': 'Lao', 'la': 'Latin',
  'lv': 'Latvian', 'lt': 'Lithuanian', 'lb': 'Luxembourgish', 'mk': 'Macedonian',
  'mg': 'Malagasy', 'ms': 'Malay', 'ml': 'Malayalam', 'mt': 'Maltese',
  'mi': 'Maori', 'mr': 'Marathi', 'mn': 'Mongolian', 'my': 'Myanmar',
  'ne': 'Nepali', 'no': 'Norwegian', 'ps': 'Pashto', 'fa': 'Persian',
  'pl': 'Polish', 'pt': 'Portuguese', 'pa': 'Punjabi', 'ro': 'Romanian',
  'ru': 'Russian', 'sm': 'Samoan', 'gd': 'Scottish Gaelic', 'sr': 'Serbian',
  'st': 'Sesotho', 'sn': 'Shona', 'sd': 'Sindhi', 'si': 'Sinhala',
  'sk': 'Slovak', 'sl': 'Slovenian', 'so': 'Somali', 'es': 'Spanish',
  'su': 'Sundanese', 'sw': 'Swahili', 'sv': 'Swedish', 'tg': 'Tajik',
  'ta': 'Tamil', 'te': 'Telugu', 'th': 'Thai', 'tr': 'Turkish',
  'uk': 'Ukrainian', 'ur': 'Urdu', 'ug': 'Uyghur', 'uz': 'Uzbek',
  'vi': 'Vietnamese', 'cy': 'Welsh', 'xh': 'Xhosa', 'yi': 'Yiddish',
  'yo': 'Yoruba', 'zu': 'Zulu'
};

/**
 * Translate text (GET)
 */
async function translate(url, corsHeaders) {
  const text = url.searchParams.get('text');
  const to = (url.searchParams.get('to') || 'en').toLowerCase();
  const from = url.searchParams.get('from') ? url.searchParams.get('from').toLowerCase() : undefined;
  
  if (!text) {
    return new Response(JSON.stringify({ 
      error: 'Please provide text parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  return await doTranslate(text, to, from, corsHeaders);
}

/**
 * Translate text (POST)
 */
async function translatePost(request, corsHeaders) {
  const body = await request.json();
  const text = body.text;
  const to = (body.to || 'en').toLowerCase();
  const from = body.from ? body.from.toLowerCase() : undefined;
  
  if (!text) {
    return new Response(JSON.stringify({ 
      error: 'Please provide text in request body' 
    }), { status: 400, headers: corsHeaders });
  }
  
  return await doTranslate(text, to, from, corsHeaders);
}

/**
 * Do the actual translation via MyMemory API
 */
async function doTranslate(text, to, from, corsHeaders) {
  const langPair = from ? `${from}|${to}` : `en|${to}`;
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.responseStatus !== 200) {
    return new Response(JSON.stringify({ error: 'Translation failed' }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
  
  return new Response(JSON.stringify({
    text,
    translated_text: data.responseData.translatedText,
    from: from || data.responseData.detectedLanguage,
    to,
    confidence: data.responseData.match,
    provider: 'MyMemory'
  }), { headers: corsHeaders });
}

/**
 * List supported languages
 */
async function listLanguages(corsHeaders) {
  return new Response(JSON.stringify({
    count: Object.keys(LANGUAGES).length,
    languages: LANGUAGES
  }), { headers: corsHeaders });
}

/**
 * Detect language
 */
async function detectLanguage(url, corsHeaders) {
  const text = url.searchParams.get('text');
  
  if (!text) {
    return new Response(JSON.stringify({ 
      error: 'Please provide text parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 100))}&langpair=en|fr`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  const detectedLang = data.responseData.detectedLanguage || 'unknown';
  
  return new Response(JSON.stringify({
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    detected_language: detectedLang,
    language_name: LANGUAGES[detectedLang] || 'Unknown',
    confidence: data.responseData.match
  }), { headers: corsHeaders });
}
