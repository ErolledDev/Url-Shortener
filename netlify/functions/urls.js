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
        const newUrl = {
          originalUrl: body.url,
          shortUrl: `${event.headers.host}/${shortId}`,
          shortId,
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};