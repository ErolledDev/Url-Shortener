const { nanoid } = require('nanoid');
const fs = require('fs').promises;
const path = require('path');

// File path for storing URLs
const URLS_FILE = path.join(process.cwd(), 'src', 'url-shortened.json');

// Helper function to read URLs from file
async function readUrls() {
  try {
    const data = await fs.readFile(URLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write URLs to file
async function writeUrls(urls) {
  await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

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
      const urls = await readUrls();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(urls)
      };
    }

    if (event.httpMethod === 'POST') {
      const urls = await readUrls();
      const body = JSON.parse(event.body);

      if (Array.isArray(body)) {
        // Update entire URL list
        await writeUrls(body);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(body)
        };
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

        const updatedUrls = [newUrl, ...urls];
        await writeUrls(updatedUrls);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedUrls)
        };
      }
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