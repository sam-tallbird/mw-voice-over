'use client'

import { useState } from 'react';

interface ConnectionTestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  apiKeyPresent?: boolean;
  apiKeyLength?: number;
  modelsAvailable?: number;
  ttsModelAvailable?: boolean;
  ttsModelName?: string;
}

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to reach test endpoint',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Google GenAI Connection Test</h3>
      
      <button
        onClick={testConnection}
        disabled={testing}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {testing ? 'Testing Connection...' : 'Test Connection'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
          <div className="flex items-center mb-2">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-medium">
              {result.success ? 'Connection Successful!' : 'Connection Failed'}
            </span>
          </div>
          
          {result.message && (
            <p className="text-sm text-gray-700 mb-2">{result.message}</p>
          )}
          
          {result.error && (
            <p className="text-sm text-red-700 mb-2">Error: {result.error}</p>
          )}
          
          {result.details && (
            <p className="text-xs text-gray-600 mb-2">Details: {result.details}</p>
          )}
          
          {result.success && (
            <div className="text-sm text-gray-700 space-y-1">
              <div>✅ API Key Present: {result.apiKeyPresent ? 'Yes' : 'No'}</div>
              <div>📏 API Key Length: {result.apiKeyLength} characters</div>
              <div>🔧 Models Available: {result.modelsAvailable}</div>
              <div>🎵 TTS Model Available: {result.ttsModelAvailable ? 'Yes' : 'No'}</div>
              {result.ttsModelName && result.ttsModelName !== 'Not found' && (
                <div>🎤 TTS Model: {result.ttsModelName}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 