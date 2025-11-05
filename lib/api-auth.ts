import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './auth';

export function getUserFromRequest(req: NextApiRequest): JWTPayload | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): JWTPayload | null {
  const user = getUserFromRequest(req);
  
  if (!user) {
    res.status(401).json({ message: '認証が必要です' });
    return null;
  }
  
  return user;
}

export function requireSameUser(req: NextApiRequest, res: NextApiResponse, userId: string): JWTPayload | null {
  const user = requireAuth(req, res);
  
  if (!user) {
    return null;
  }
  
  if (user.userId !== userId) {
    res.status(403).json({ message: 'アクセス権限がありません' });
    return null;
  }
  
  return user;
}
