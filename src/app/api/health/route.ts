import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    services: {
      database: 'connected', // In production, add actual checks
      storage: 'connected',
      auth: 'connected',
    },
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export const revalidate = 0;
