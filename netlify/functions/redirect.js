exports.handler = async (event) => {
  const shortId = event.path.split('/').pop();
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const response = await fetch(`${event.headers.host}/.netlify/functions/urls`);
    const urls = await response.json();
    const url = urls.find(u => u.shortId === shortId);

    if (url) {
      // Update click count
      url.totalClicks = (url.totalClicks || 0) + 1;
      url.lastClickedAt = Date.now();

      // Save updated stats
      await fetch(`${event.headers.host}/.netlify/functions/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urls)
      });

      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: url.originalUrl
        }
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'URL not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};