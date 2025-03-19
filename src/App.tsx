import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

interface ShortenedURL {
  originalUrl: string;
  shortUrl: string;
  shortId: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing URLs from JSON file when component mounts
    fetch('/api/urls')
      .then(response => response.json())
      .then(data => {
        setShortenedUrls(data);
      })
      .catch(error => {
        console.error('Error loading URLs:', error);
        setError('Failed to load URLs');
      });
  }, []);

  const saveUrls = async (urls: ShortenedURL[]) => {
    try {
      await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(urls, null, 2),
      });
    } catch (error) {
      console.error('Error saving URLs:', error);
      throw new Error('Failed to save URLs');
    }
  };

  const generateShortUrl = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      const shortId = nanoid(8);
      const newShortenedUrl = {
        originalUrl: url,
        shortUrl: `${window.location.origin}/${shortId}`,
        shortId
      };

      const updatedUrls = [newShortenedUrl, ...shortenedUrls];
      setShortenedUrls(updatedUrls);
      await saveUrls(updatedUrls);

      setUrl('');
      setError('');
    } catch (err) {
      console.error('Error generating URL:', err);
      setError('Error generating short URL');
    }
  };

  const handleRedirect = async () => {
    const path = window.location.pathname.substring(1);
    if (path && path.length === 8) {
      try {
        const response = await fetch('/api/urls');
        const urls = await response.json();
        const match = urls.find((u: ShortenedURL) => u.shortId === path);
        if (match) {
          window.location.href = match.originalUrl;
        }
      } catch (error) {
        console.error('Error during redirect:', error);
      }
    }
  };

  // Check if we're on a shortened URL path
  useEffect(() => {
    handleRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">URL Shortener</h1>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your URL here"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <button
              onClick={generateShortUrl}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Shorten URL
            </button>
          </div>

          {shortenedUrls.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Shortened URLs</h2>
              <div className="space-y-4">
                {shortenedUrls.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Original URL:</p>
                    <p className="text-gray-800 break-all">{item.originalUrl}</p>
                    <p className="text-sm text-gray-600 mt-2 mb-1">Shortened URL:</p>
                    <a 
                      href={item.shortUrl} 
                      className="text-blue-600 hover:text-blue-800 break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.shortUrl}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;