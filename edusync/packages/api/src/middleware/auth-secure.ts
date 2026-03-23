import { Request, Response, NextFunction } from 'express';
import JWTService from '../lib/jwt.service.js';

/**
 * Secure authentication middleware
 * Validates JWT and checks for revocation
 */
  export async function secureAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Missing authorization token' },
      });
    }
  
    const token = authHeader.slice(7);
    const payload = await JWTService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
  }

  // Attach user info to request
  (req as any).user = payload;
  next();
}

/**
 * Refresh token endpoint (handles token rotation)
 */
export async function handleTokenRefresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_REFRESH_TOKEN', message: 'Missing refresh token' },
      });
    }

    const tokens = await JWTService.rotateTokens(refreshToken);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'TOKEN_ROTATION_FAILED', message: 'Failed to rotate tokens' },
    });
  }
}

/**
 * Logout endpoint (revokes token)
 */
export function handleLogout(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    JWTService.revokeToken(token);
  }

  res.json({ success: true, message: 'Logged out successfully' });
}
