import { NextRequest, NextResponse } from 'next/server';

// In-memory store for pairing sessions (in production, use Redis or database)
const pairingSessions = new Map<string, {
  id: string;
  status: 'waiting' | 'connected' | 'disconnected';
  createdAt: number;
  expiresAt: number;
  deviceCode?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      status: 'waiting' as const,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    };
    
    pairingSessions.set(sessionId, session);
    
    return NextResponse.json({
      success: true,
      sessionId,
      deviceCode: session.id.slice(-6).toUpperCase(),
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Error creating pairing session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pairing session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID required' },
      { status: 400 }
    );
  }
  
  const session = pairingSessions.get(sessionId);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    );
  }
  
  if (Date.now() > session.expiresAt) {
    pairingSessions.delete(sessionId);
    return NextResponse.json(
      { success: false, error: 'Session expired' },
      { status: 410 }
    );
  }
  
  return NextResponse.json({
    success: true,
    session: {
      id: session.id,
      status: session.status,
      deviceCode: session.deviceCode,
      expiresAt: session.expiresAt,
    },
  });
}
