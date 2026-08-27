import { NextResponse } from 'next/server';

// Public TURN server configuration (for production, use your own TURN server)
// Using Coturn public servers for demo purposes
const turnServers = [
  {
    urls: ['stun:stun.l.google.com:19302'],
  },
  {
    urls: ['stun:stun1.l.google.com:19302'],
  },
  {
    urls: ['stun:stun2.l.google.com:19302'],
  },
];

export async function GET() {
  // In production, you would generate time-limited TURN credentials here
  // using your TURN server's REST API
  
  return NextResponse.json({
    success: true,
    iceServers: turnServers,
  });
}
