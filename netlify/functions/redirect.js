exports.handler = async (event) => {
  const shortId = event.path.split('/').pop();
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const baseUrl = event.headers.host.startsWith('localhost') 
      ? `http://${event.headers.host}`
      : `https://${event.headers.host}`;

    const response = await fetch(`${baseUrl}/.netlify/functions/urls`);
    if (!response.ok) {
      throw new Error(`Failed to fetch URLs: ${response.statusText}`);
    }

    const urls = await response.json();
    const url = urls.find(u => u.shortId === shortId);

    if (url) {
      // Update click count
      url.totalClicks = (url.totalClicks || 0) + 1;
      url.lastClickedAt = Date.now();

      // Save updated stats
      const updateResponse = await fetch(`${baseUrl}/.netlify/functions/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urls)
      });

      if (!updateResponse.ok) {
        console.error('Failed to update click stats');
      }

      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: url.originalUrl.startsWith('http') ? url.originalUrl : `https://${url.originalUrl}`
        }
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'URL not found' })
    };
  } catch (error) {
    console.error('Error in redirect function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};