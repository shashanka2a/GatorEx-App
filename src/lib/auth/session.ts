import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserById } from './verification';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';
const COOKIE_NAME = 'gatorex-session';

export interface SessionData {
  userId: string;
  email: string;
  verified: boolean;
}

export function createSession(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, verified: true },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifySession(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextApiResponse, token: string) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  ]);
}

export function clearSessionCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', [
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  ]);
}

export function getSessionFromRequest(req: NextApiRequest): SessionData | null {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

export function getSessionFromNextRequest(req: NextRequest): SessionData | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<SessionData | null> {
  const session = getSessionFromRequest(req);
  
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  
  // Verify user still exists and is verified
  const user = await getUserById(session.userId);
  if (!user || !user.ufEmailVerified) {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Invalid session' });
    return null;
  }
  
  return session;
}

export function createSessionResponse(token: string, redirectTo: string = '/buy'): NextResponse {
  const response = NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_APP_URL));
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
  return response;
}