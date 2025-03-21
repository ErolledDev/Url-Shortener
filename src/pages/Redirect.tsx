import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ShortenedURL } from '../types';

function Redirect() {
  const { shortId } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToUrl = async () => {
      try {
        const response = await fetch('/api/urls');
        const urls: ShortenedURL[] = await response.json();
        const urlData = urls.find(u => u.shortId === shortId);
        
        if (urlData) {
          // Update click count and last clicked timestamp
          const updatedUrls = urls.map(url => {
            if (url.shortId === shortId) {
              return {
                ...url,
                totalClicks: (url.totalClicks || 0) + 1,
                lastClickedAt: Date.now()
              };
            }
            return url;
          });

          // Save updated stats
          await fetch('/api/urls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUrls)
          });

          window.location.href = urlData.originalUrl;
        } else {
          setError('URL not found');
        }
      } catch (err) {
        setError('Failed to redirect');
      }
    };

    redirectToUrl();
  }, [shortId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-700">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}

export default Redirect;