import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';
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

    fetch('/api/urls')
      .then(response => response.json())
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
      const newShortenedUrl: ShortenedURL = {
        originalUrl: url,
        shortUrl: `${window.location.origin}/${shortId}`,
        shortId,
        username: username || undefined,
        password: password || undefined,
        createdAt: Date.now()
      };

      const updatedUrls = [newShortenedUrl, ...shortenedUrls];
      setShortenedUrls(updatedUrls);
      await saveUrls(updatedUrls);

      if (!username) {
        localStorage.setItem(`url_${shortId}`, 'true');
      }
      setUserUrls([newShortenedUrl, ...userUrls]);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Shorten URLs with</span>
                  <span className="block text-blue-200">Professional Tools</span>
                </h1>
                <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                  Create, manage, and track short URLs. Perfect for social media, marketing campaigns, and personal use.
                </p>
              </motion.div>

              {/* URL Shortener Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 sm:mt-12"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter your long URL
                          </label>
                          <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                          />
                        </div>

                        {!isLoggedIn && (
                          <div className="flex items-center justify-between">
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

                              {!isLoggedIn && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={handleLogin}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                                  >
                                    Login
                                  </button>
                                </div>
                              )}

                              {isLoggedIn && (
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

                        {error && (
                          <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
                            {error}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={generateShortUrl}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Shorten URL
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Stats Section */}
      <Stats />

      {/* Pricing Section */}
      <Pricing />

      {/* URLs Section */}
      {userUrls.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Your Shortened URLs
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {userUrls.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Original URL</h3>
                      <p className="text-gray-800 break-all mt-1">{item.originalUrl}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Shortened URL</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <a 
                          href={item.shortUrl} 
                          className="text-blue-600 hover:text-blue-800 break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(item.shortUrl, item.shortId)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {copied === item.shortId ? (
                            <span className="text-green-600 text-sm">Copied!</span>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {item.username && (
                      <div className="flex gap-4 pt-3 border-t border-gray-200 mt-3">
                        <a 
                          href={`/edit/${item.shortId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </a>
                        <a 
                          href={`/delete/${item.shortId}`}
                          className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;