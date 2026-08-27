import { NextRequest, NextResponse } from 'next/server';

// In-memory store for signaling messages (in production, use Redis or WebSocket server)
const signalingMessages = new Map<string, Array<{
  type: string;
  data: any;
  timestamp: number;
  from: 'desktop' | 'mobile';
}>>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, type, data, from } = body;
    
    if (!sessionId || !type) {
      return NextResponse.json(
        { success: false, error: 'Session ID and type required' },
        { status: 400 }
      );
    }
    
    const messages = signalingMessages.get(sessionId) || [];
    messages.push({
      type,
      data,
      timestamp: Date.now(),
      from: from as 'desktop' | 'mobile',
    });
    
    // Keep only last 50 messages per session
    if (messages.length > 50) {
      messages.shift();
    }
    
    signalingMessages.set(sessionId, messages);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending signaling message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send signaling message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const lastTimestamp = searchParams.get('lastTimestamp');
  
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID required' },
      { status: 400 }
    );
  }
  
  const messages = signalingMessages.get(sessionId) || [];
  
  // Filter messages since last timestamp for polling
  const filteredMessages = lastTimestamp
    ? messages.filter(m => m.timestamp > parseInt(lastTimestamp))
    : messages;
  
  // Clean old messages (older than 1 minute)
  const now = Date.now();
  const cleanedMessages = messages.filter(m => now - m.timestamp < 60000);
  signalingMessages.set(sessionId, cleanedMessages);
  
  return NextResponse.json({
    success: true,
    messages: filteredMessages,
    lastTimestamp: now,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    
    if (sessionId) {
      signalingMessages.delete(sessionId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing signaling messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear signaling messages' },
      { status: 500 }
    );
  }
}
