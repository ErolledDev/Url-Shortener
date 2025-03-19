import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Pricing from '../components/Pricing';
import type { ShortenedURL } from '../types';

function Home() {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);
  const [error, setError] = useState('');
  const [userUrls, setUserUrls] = useState<ShortenedURL[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('shortener_username');
    const savedPassword = localStorage.getItem('shortener_password');
    if (savedUsername && savedPassword) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      setPassword(savedPassword);
    }

    fetch('/.netlify/functions/urls')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setShortenedUrls(data);
        if (savedUsername && savedPassword) {
          const userSpecificUrls = data.filter((url: ShortenedURL) => 
            url.username === savedUsername && url.password === savedPassword
          );
          setUserUrls(userSpecificUrls);
        } else {
          const sessionUrls = data.filter((url: ShortenedURL) => {
            const sessionKey = `url_${url.shortId}`;
            return localStorage.getItem(sessionKey) === 'true';
          });
          setUserUrls(sessionUrls);
        }
      })
      .catch(error => {
        console.error('Error loading URLs:', error);
        setError('Failed to load URLs');
      });
  }, []);

  const handleLogin = () => {
    const matchingUrls = shortenedUrls.filter(
      url => url.username === username && url.password === password
    );
    if (matchingUrls.length > 0) {
      localStorage.setItem('shortener_username', username);
      localStorage.setItem('shortener_password', password);
      setIsLoggedIn(true);
      setUserUrls(matchingUrls);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shortener_username');
    localStorage.removeItem('shortener_password');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setUserUrls([]);
  };

  const generateShortUrl = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: url,
          username: username || undefined,
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUrls = await response.json();
      setShortenedUrls(updatedUrls);
      
      const newUrl = updatedUrls[0]; // The newly added URL is at the start
      if (!username) {
        localStorage.setItem(`url_${newUrl.shortId}`, 'true');
      }
      setUserUrls([newUrl, ...userUrls]);

      setUrl('');
      setError('');
    } catch (err) {
      console.error('Error generating URL:', err);
      setError('Error generating short URL');
    }
  };

  const copyToClipboard = async (text: string, shortId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(shortId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Transform Your Links
              <span className="block text-blue-200 mt-2">Into Powerful Tools</span>
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
              Create memorable, trackable short links in seconds. Perfect for social media, marketing campaigns, and personal use.
            </p>
          </motion.div>

          {/* URL Shortener Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex flex-col gap-6">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your long URL
                  </label>
                  <div className="flex gap-4">
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                    <button
                      onClick={generateShortUrl}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Shorten
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}

                {!isLoggedIn && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setShowAuth(!showAuth)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      {showAuth ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                          Hide account options
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Create account (optional)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {(showAuth || isLoggedIn) && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoggedIn}
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoggedIn}
                          />
                        </div>
                      </div>

                      {!isLoggedIn ? (
                        <div className="flex justify-end">
                          <button
                            onClick={handleLogin}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                          >
                            Login
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Logged in as <span className="font-medium">{username}</span>
                          </p>
                          <button
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* URLs Table */}
            {userUrls.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Original URL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Short URL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userUrls.map((item) => (
                        <tr key={item.shortId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="truncate max-w-xs">
                              {item.originalUrl}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <a 
                                href={item.shortUrl}
                                className="text-blue-600 hover:text-blue-800"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.shortUrl.split('/').pop()}
                              </a>
                              <button
                                onClick={() => copyToClipboard(item.shortUrl, item.shortId)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {copied === item.shortId ? (
                                  <span className="text-green-600 text-xs">Copied!</span>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.totalClicks || 0}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-3">
                              {item.username && (
                                <>
                                  <a 
                                    href={`/edit/${item.shortId}`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </a>
                                  <a 
                                    href={`/delete/${item.shortId}`}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </a>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Stats Section */}
      <Stats />

      {/* Pricing Section */}
      <Pricing />

      <Footer />
    </div>
  );
}

export default Home;