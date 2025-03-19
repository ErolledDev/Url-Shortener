import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ShortenedURL } from '../types';

function Delete() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [urlDetails, setUrlDetails] = useState<ShortenedURL | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch('/api/urls');
        const urls: ShortenedURL[] = await response.json();
        const url = urls.find(u => u.shortId === shortId);
        if (url) {
          setUrlDetails(url);
        }
      } catch (err) {
        setError('Failed to load URL details');
      }
    };
    fetchUrl();
  }, [shortId]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/urls');
      const urls: ShortenedURL[] = await response.json();
      const urlToDelete = urls.find(u => u.shortId === shortId);

      if (!urlToDelete) {
        setError('URL not found');
        return;
      }

      if (urlToDelete.username !== username || urlToDelete.password !== password) {
        setError('Invalid username or password');
        return;
      }

      const updatedUrls = urls.filter(u => u.shortId !== shortId);
      
      await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUrls)
      });

      // Remove from session
      localStorage.removeItem(`url_${shortId}`);
      
      setSuccess('URL deleted successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Delete Shortened URL</h1>
          
          {urlDetails && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm font-medium text-gray-700">Are you sure you want to delete this URL?</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Original URL:</p>
                <p className="text-gray-800 break-all mt-1">{urlDetails.originalUrl}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Short URL:</p>
                <p className="text-gray-800 break-all mt-1">{urlDetails.shortUrl}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleDelete} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 text-sm bg-green-50 p-2 rounded">
                {success}
              </p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete URL
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Delete;