import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

export interface AuthSession {
  token: string;
  userId: string;
  createdAt: number;
}

// In-memory token store mapped to sessions
const sessions = new Map<string, AuthSession>();

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    token,
    userId,
    createdAt: Date.now(),
  });
  return token;
}

export function removeSession(token: string): void {
  sessions.delete(token);
}

export function getUserIdFromToken(token?: string): string | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  // Expire after 7 days
  if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return null;
  }
  return session.userId;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-auth-token'] as string);

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'User session invalid. Please log in again.' });
  }

  req.userId = userId;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-auth-token'] as string);

  const userId = getUserIdFromToken(token);
  if (userId) {
    req.userId = userId;
  }
  next();
}
