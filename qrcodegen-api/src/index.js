/**
 * QRCodeGen API - Generate QR codes and barcodes instantly
 * No external dependencies - pure implementation
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
      // Route: GET /qrcode - Generate QR code
      if (path === '/qrcode' && request.method === 'GET') {
        return await generateQRCode(url, corsHeaders);
      }
      
      // Route: GET /barcode - Generate barcode (Code128)
      if (path === '/barcode' && request.method === 'GET') {
        return await generateBarcode(url, corsHeaders);
      }
      
      // Route: GET / - API info
      if (path === '/' || path === '') {
        return new Response(JSON.stringify({
          name: 'QRCodeGen API',
          version: '1.0.0',
          description: 'Generate QR codes and barcodes instantly',
          endpoints: [
            { path: '/qrcode', method: 'GET', params: 'text, size, format', description: 'Generate QR code' },
            { path: '/barcode', method: 'GET', params: 'text, format', description: 'Generate Code128 barcode' }
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
 * Generate QR Code using Google Chart API (simple approach)
 */
async function generateQRCode(url, corsHeaders) {
  const text = url.searchParams.get('text') || url.searchParams.get('data');
  const size = url.searchParams.get('size') || '200x200';
  const format = url.searchParams.get('format') || 'png';
  
  if (!text) {
    return new Response(JSON.stringify({ 
      error: 'Please provide text or data parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  // Use QRServer.com free API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(text)}`;
  
  const response = await fetch(qrUrl);
  const imageBuffer = await response.arrayBuffer();
  
  // Return base64 encoded image
  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  
  if (format === 'base64') {
    return new Response(JSON.stringify({
      text,
      size,
      image: `data:image/png;base64,${base64}`
    }), { headers: corsHeaders });
  }
  
  if (format === 'url') {
    return new Response(JSON.stringify({
      text,
      size,
      url: qrUrl
    }), { headers: corsHeaders });
  }
  
  // Return image directly
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * Generate Code128 Barcode
 */
async function generateBarcode(url, corsHeaders) {
  const text = url.searchParams.get('text') || url.searchParams.get('data');
  const format = url.searchParams.get('format') || 'png';
  
  if (!text) {
    return new Response(JSON.stringify({ 
      error: 'Please provide text or data parameter' 
    }), { status: 400, headers: corsHeaders });
  }
  
  // Use barcode API
  const barcodeUrl = `https://barcodeapi.org/api/code128/${encodeURIComponent(text)}`;
  
  const response = await fetch(barcodeUrl);
  const imageBuffer = await response.arrayBuffer();
  
  if (format === 'base64') {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    return new Response(JSON.stringify({
      text,
      type: 'Code128',
      image: `data:image/png;base64,${base64}`
    }), { headers: corsHeaders });
  }
  
  if (format === 'url') {
    return new Response(JSON.stringify({
      text,
      type: 'Code128',
      url: barcodeUrl
    }), { headers: corsHeaders });
  }
  
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
