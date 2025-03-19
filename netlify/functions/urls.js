const { nanoid } = require('nanoid');

// In-memory cache (this will reset on function cold starts)
let urls = [];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Return all URLs
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(urls)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      if (Array.isArray(body)) {
        // Update entire URL list
        urls = body;
      } else {
        // Create new short URL
        const shortId = body.customId || nanoid(8);
        const baseUrl = event.headers.host.startsWith('localhost') 
          ? `http://${event.headers.host}`
          : `https://${event.headers.host}`;
          
        const newUrl = {
          originalUrl: body.originalUrl,
          shortUrl: `${baseUrl}/${shortId}`,
          shortId,
          username: body.username,
          password: body.password,
          createdAt: Date.now(),
          totalClicks: 0
        };
        urls.unshift(newUrl);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(urls)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error in urls function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};