'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

type UsageInfo = {
  current_usage: number;
  max_usage: number;
  usage_remaining: number;
  plan_type: string;
  last_reset: string;
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsageInfo = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc(
          'get_user_usage',
          { user_id_param: user.id }
        );
        
        if (error) {
          console.error('Error fetching usage info:', error);
        } else {
          setUsageInfo(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch usage info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageInfo();
  }, [user]);
  
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <p><strong>Email:</strong> {user.email}</p>
        
        {loading ? (
          <p>Loading usage information...</p>
        ) : usageInfo ? (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Usage Information</h3>
            <p><strong>Plan:</strong> {usageInfo.plan_type}</p>
            <p><strong>Used:</strong> {usageInfo.current_usage} of {usageInfo.max_usage}</p>
            <p><strong>Remaining:</strong> {usageInfo.usage_remaining}</p>
            <p><strong>Last Reset:</strong> {new Date(usageInfo.last_reset).toLocaleDateString()}</p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${(usageInfo.current_usage / usageInfo.max_usage) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p>No usage information available</p>
        )}
      </div>
    </div>
  );
} 