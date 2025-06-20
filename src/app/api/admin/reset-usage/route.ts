import { NextResponse } from 'next/server';
import { resetAllUsage } from '@/lib/users';

export const runtime = 'nodejs';

// Simple admin key for demo (in production, use proper admin authentication)
const ADMIN_KEY = 'moonwhale-admin-reset-2024';

export async function POST(req: Request) {
  try {
    const { adminKey } = await req.json();

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const success = resetAllUsage();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'All user usage counts have been reset to 0'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to reset usage' },
        { status: 500 }
      );
    }

  } catch (err: any) {
    console.error('Reset usage error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 