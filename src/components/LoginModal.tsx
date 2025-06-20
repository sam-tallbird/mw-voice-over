'use client'

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (token: string, user: any) => void;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onLogin, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('mw_token', data.token);
      localStorage.setItem('mw_user', JSON.stringify(data.user));

      onLogin(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'demo1@mw.com', password: 'A7k$9mX2nP4qW8vZ' },
    { email: 'demo2@mw.com', password: 'B9p#5rY7sL3uE6tR' },
    { email: 'demo3@mw.com', password: 'C4w@8nM1oQ9kI2xV' },
    { email: 'demo4@mw.com', password: 'D6z%3fH5gJ7bN0cF' },
    { email: 'demo5@mw.com', password: 'E8t!1dA4hK6yU9sG' }
  ];

  const fillDemo = (creds: { email: string; password: string }) => {
    setEmail(creds.email);
    setPassword(creds.password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in to MoonWhale Voice-Over
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Demo access with limited usage
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="demo1@mw.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="16-character password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-sm text-purple-600 hover:text-purple-500 underline"
            >
              {showCredentials ? 'Hide' : 'Show'} Demo Credentials
            </button>

            {showCredentials && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Accounts (3 uses each):</h3>
                <div className="space-y-2">
                  {demoCredentials.map((creds, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="text-gray-700 flex-1 mr-2">
                        <div className="font-medium">{creds.email}</div>
                        <div className="font-mono text-xs break-all">{creds.password}</div>
                      </div>
                      <button
                        onClick={() => fillDemo(creds)}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex-shrink-0"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 