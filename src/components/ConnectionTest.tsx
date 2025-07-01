'use client'

import { useState, useEffect } from 'react';

interface ConnectionTestResult {
  timestamp?: string;
  gemini: {
    success: boolean;
    details?: {
      api_key_length?: number;
      total_models?: number;
      tts_model_available?: boolean;
      tts_model_name?: string;
      error?: string;
    };
  };
  supabase: {
    success: boolean;
    details?: {
      message?: string;
      url_configured?: boolean;
      service_key_configured?: boolean;
      ready_for_schema?: boolean;
      error?: string;
    };
  };
  overall: {
    success: boolean;
    message?: string;
    next_steps?: string;
  };
}

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent SSR issues
  }

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        gemini: { success: false, details: { error: 'Failed to reach test endpoint' } },
        supabase: { success: false, details: { error: 'Failed to reach test endpoint' } },
        overall: { success: false, message: 'Connection test failed to run' }
      });
    } finally {
      setTesting(false);
    }
  };

  const StatusIcon = ({ success }: { success: boolean }) => (
    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${success ? 'bg-green-500' : 'bg-red-500'}`}></span>
  );

  const formatDetails = (details: any) => {
    if (!details || typeof details !== 'object') return null;
    
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs text-gray-600">
        <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {String(value)}
      </div>
    ));
  };

  const TestSection = ({ title, testResult, icon }: { 
    title: string; 
    testResult: any; 
    icon: string;
  }) => (
    <div className={`p-4 rounded-lg border ${
      testResult.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center mb-2">
        <span className="text-lg mr-2">{icon}</span>
        <StatusIcon success={testResult.success} />
        <span className="font-medium">{title}</span>
      </div>
      
      {testResult.success && testResult.details && (
        <div className="space-y-1">
          {/* Gemini-specific details */}
          {testResult.details.api_key_length && (
            <>
              <div className="text-sm text-green-700">✅ API Key Length: {testResult.details.api_key_length} chars</div>
              <div className="text-sm text-green-700">🔧 Models Available: {testResult.details.total_models}</div>
              <div className="text-sm text-green-700">🎵 TTS Available: {testResult.details.tts_model_available ? 'Yes' : 'No'}</div>
              {testResult.details.tts_model_name && testResult.details.tts_model_name !== 'Not found' && (
                <div className="text-sm text-green-700">🎤 TTS Model: {testResult.details.tts_model_name}</div>
              )}
            </>
          )}
          
          {/* Supabase-specific details */}
          {testResult.details.message && (
            <>
              <div className="text-sm text-green-700">✅ {testResult.details.message}</div>
              <div className="text-sm text-green-700">🔗 URL Configured: {testResult.details.url_configured ? 'Yes' : 'No'}</div>
              <div className="text-sm text-green-700">🔑 Service Key: {testResult.details.service_key_configured ? 'Yes' : 'No'}</div>
              <div className="text-sm text-green-700">📋 Ready for Schema: {testResult.details.ready_for_schema ? 'Yes' : 'No'}</div>
            </>
          )}
        </div>
      )}
      
      {!testResult.success && testResult.details?.error && (
        <p className="text-sm text-red-700 mb-2">❌ {testResult.details.error}</p>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">🔍 MoonWhale Connection Test</h3>
      <p className="text-gray-600 mb-4">Test your Gemini API and Supabase database connections</p>
      
      <button
        onClick={testConnection}
        disabled={testing}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {testing ? '🔄 Testing Connections...' : '🚀 Test All Connections'}
      </button>

      {result && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${
            result.overall.success 
              ? 'bg-green-100 border-green-300' 
              : 'bg-yellow-100 border-yellow-300'
          }`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">
                {result.overall.success ? '🎉' : '⚠️'}
              </span>
              <span className="font-bold text-lg">
                {result.overall.success ? 'All Systems Ready!' : 'Setup Issues'}
              </span>
            </div>
            <p className="text-gray-700">{result.overall.message}</p>
            
            {result.overall.next_steps && (
              <div className="mt-2 p-2 bg-blue-200 rounded text-blue-800 text-sm">
                📋 Next: {result.overall.next_steps}
              </div>
            )}
            
            {result.timestamp && (
              <div className="text-xs text-gray-500 mt-2">
                Tested at: {new Date(result.timestamp).toLocaleString()}
              </div>
            )}
          </div>

          {/* Individual Test Results */}
          <div className="grid md:grid-cols-2 gap-4">
            <TestSection 
              title="Gemini AI API" 
              testResult={result.gemini} 
              icon="🤖"
            />
            
            <TestSection 
              title="Supabase Database" 
              testResult={result.supabase} 
              icon="🗄️"
            />
          </div>

          {/* Next Steps */}
          {result.overall.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🎉 Ready for Next Steps:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• ✅ Deploy Supabase schema from docs/supabase-complete-schema.md</li>
                <li>• ✅ Add user authentication (optional)</li>
                <li>• ✅ Enable usage tracking and quotas</li>
                <li>• ✅ Add Iraqi voice selection (10 voices)</li>
              </ul>
            </div>
          )}

          {!result.overall.success && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">❌ Issues to Fix:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {!result.gemini.success && (
                  <li>• Fix Gemini API connection (check GEMINI_API_KEY in .env)</li>
                )}
                {!result.supabase.success && (
                  <li>• Fix Supabase connection (check URL and keys in .env)</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 