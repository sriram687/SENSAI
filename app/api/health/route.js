import { NextResponse } from 'next/server';
import { db } from '../../../lib/inngest/prisma';

export async function GET() {
  try {
    // Check if database connection is available
    if (!db) {
      return NextResponse.json({
        status: 'warning',
        message: 'Database connection not available',
        database: false,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    // Try to connect to database
    await db.$connect();
    
    // Simple query to test connection
    const result = await db.$runCommandRaw({ ping: 1 });
    
    return NextResponse.json({
      status: 'healthy',
      message: 'All systems operational',
      database: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      database: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 to avoid breaking the app
  } finally {
    if (db) {
      await db.$disconnect();
    }
  }
}
