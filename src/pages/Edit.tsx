import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ShortenedURL, EditURLFormData } from '../types';

function Edit() {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditURLFormData>({
    username: '',
    password: '',
    newShortId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const response = await fetch('/api/urls');
        const urls: ShortenedURL[] = await response.json();
        const url = urls.find(u => u.shortId === shortId);
        if (url) {
          setOriginalUrl(url.originalUrl);
        }
      } catch (err) {
        setError('Failed to load URL details');
      }
    };
    fetchUrl();
  }, [shortId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/urls');
      const urls: ShortenedURL[] = await response.json();
      const urlToEdit = urls.find(u => u.shortId === shortId);

      if (!urlToEdit) {
        setError('URL not found');
        return;
      }

      if (urlToEdit.username !== formData.username || urlToEdit.password !== formData.password) {
        setError('Invalid username or password');
        return;
      }

      if (formData.newShortId) {
        if (urls.some(u => u.shortId === formData.newShortId)) {
          setError('Custom short ID already exists');
          return;
        }
        urlToEdit.shortId = formData.newShortId;
        urlToEdit.shortUrl = `${window.location.origin}/${formData.newShortId}`;
      }

      const updatedUrls = urls.map(u => u.shortId === shortId ? urlToEdit : u);
      
      await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUrls)
      });

      setSuccess('URL updated successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Failed to update URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Edit Shortened URL</h1>
          
          {originalUrl && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Original URL:</p>
              <p className="text-gray-800 break-all mt-1">{originalUrl}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Short ID (optional)</label>
              <input
                type="text"
                value={formData.newShortId}
                onChange={(e) => setFormData({...formData, newShortId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty to keep current ID"
              />
              <p className="mt-1 text-sm text-gray-500">
                Current ID: {shortId}
              </p>
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Update URL
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

export default Edit;