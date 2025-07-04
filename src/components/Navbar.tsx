'use client'

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const navItems = [
    { href: '/', label: 'home' },
    { href: '/pricing', label: 'pricing' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex items-center px-4 sm:px-8 md:px-16 lg:px-32 py-4">
        {/* Logo - Left aligned */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            <img
              src="/klam.svg"
              alt="Klam"
              className="h-5 w-auto"
            />
          </Link>
        </div>

        {/* Spacer to push nav to the right */}
        <div className="flex-1"></div>

        {/* Desktop Navigation - Right aligned */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link relative text-gray-800 text-base font-bold uppercase px-2.5 tracking-wide"
              >
                <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.4,1,0.8,1)]">
                  {item.label}
                </span>
              </Link>
            ))}
            
            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1073FF' }}>
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 hidden lg:block">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                style={{ backgroundColor: '#1073FF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0952CC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1073FF'}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {/* Hamburger icon */}
            <svg
              className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {/* Close icon */}
            <svg
              className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link block relative text-gray-800 px-4 py-3 text-base font-bold uppercase tracking-wide"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.4,1,0.8,1)]">
                {item.label}
              </span>
            </Link>
          ))}
          
          {/* Mobile Auth Section */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            {loading ? (
              <div className="px-4 py-2">
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1073FF' }}>
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-white text-center rounded-md transition-colors mx-4"
                style={{ backgroundColor: '#1073FF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0952CC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1073FF'}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 