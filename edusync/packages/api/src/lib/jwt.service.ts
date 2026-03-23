import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from './redis.js';

interface JWTPayload {
  sub: string; // subject (user ID)
  email: string;
  campus: string;
  role: 'student' | 'admin' | 'super_admin';
  iat: number; // issued at
  exp: number; // expiration
  type: 'access' | 'refresh';
}

/**
 * JWT Service - Handles secure token generation and validation
 */
export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
  private static readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
  private static readonly ROTATION_INTERVAL = 60 * 60; // 1 hour

  /**
   * Generate access token with short expiry
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'type'>) {
    const token = jwt.sign(
      {
        ...payload,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET!,
      {
        algorithm: 'HS256',
        expiresIn: `${this.ACCESS_TOKEN_EXPIRY}s`,
        issuer: 'edusync',
        audience: 'edusync-api',
        subject: payload.sub,
      }
    );

    return token;
  }

  /**
   * Generate refresh token with longer expiry (rotated frequently)
   */
  static generateRefreshToken(userId: string) {
    const tokenId = crypto.randomBytes(16).toString('hex');
    
    const token = jwt.sign(
      {
        sub: userId,
        type: 'refresh',
        tokenId, // Unique identifier for this token
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_REFRESH_SECRET!,
      {
        algorithm: 'HS256',
        expiresIn: `${this.REFRESH_TOKEN_EXPIRY}s`,
        issuer: 'edusync',
        audience: 'edusync-refresh',
      }
    );

    // Store token metadata in Redis with TTL
    redis.setEx(
      `refresh_token:${userId}:${tokenId}`,
      this.REFRESH_TOKEN_EXPIRY,
      JSON.stringify({
        createdAt: Date.now(),
        rotatedAt: null,
        isRevoked: false,
      })
    );

    return token;
  }

  /**
   * Verify and decode access token
   */
  static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      // Check if token is revoked
      const decoded = jwt.decode(token) as any;
      if (!decoded) return null;

      const isRevoked = await redis.get(`revoked_token:${token}`);
      if (isRevoked) {
        throw new Error('Token has been revoked');
      }

      // Verify signature and claims
      const payload = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256'],
        issuer: 'edusync',
        audience: 'edusync-api',
      }) as JWTPayload;

      return payload.type === 'access' ? payload : null;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify refresh token and generate new access + refresh tokens
   * Implements refresh token rotation
   */
  static async rotateTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      // Verify refresh token signature
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, {
        algorithms: ['HS256'],
        issuer: 'edusync',
        audience: 'edusync-refresh',
      }) as any;

      const { sub: userId, tokenId } = decoded;

      // Check if this refresh token was revoked or already rotated
      const tokenMetadata = await redis.get(`refresh_token:${userId}:${tokenId}`);
      if (!tokenMetadata) {
        throw new Error('Refresh token not found (may have expired)');
      }

      const metadata = JSON.parse(tokenMetadata);
      if (metadata.isRevoked) {
        throw new Error('Refresh token has been revoked');
      }

      // Get user data for new tokens
      // (In production, fetch from database or cache)
      const user = await this.getUserData(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Mark old refresh token as rotated
      redis.setEx(
        `refresh_token:${userId}:${tokenId}`,
        this.ROTATION_INTERVAL,
        JSON.stringify({
          ...metadata,
          rotatedAt: Date.now(),
          isRevoked: true,
        })
      );

      // Generate new tokens
      const newAccessToken = this.generateAccessToken({
        sub: userId,
        email: user.email,
        campus: user.campus,
        role: user.role,
      });

      const newRefreshToken = this.generateRefreshToken(userId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Token rotation failed:', error);
      return null;
    }
  }

  /**
   * Revoke a token immediately (for logout)
   */
  static revokeToken(token: string, ttl = this.ACCESS_TOKEN_EXPIRY) {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return;

    // Calculate remaining TTL
    const remainingTtl = decoded.exp - Math.floor(Date.now() / 1000);
    if (remainingTtl > 0) {
      redis.setEx(`revoked_token:${token}`, remainingTtl, 'true');
    }
  }

  /**
   * Revoke all tokens for a user (for security incidents)
   */
  static async revokeAllUserTokens(userId: string) {
    // Find all refresh tokens for this user
    try {
      const keys = await redis.keys(`refresh_token:${userId}:*`);
      if (!keys || keys.length === 0) return;

      keys.forEach((key: any) => {
        redis.setEx(key, 3600, JSON.stringify({
          isRevoked: true,
          revokedAt: Date.now(),
        }));
      });
      // Mark user as "needs re-login"
      redis.setEx(`user_logout_all:${userId}`, 3600, 'true');
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Helper: Get user data (implement from your database)
   */
  private static async getUserData(userId: string) {
    // TODO: Implement based on your data source
    // This is a stub
    return {
      id: userId,
      email: 'user@example.com',
      campus: 'IIT_DELHI',
      role: 'student' as const,
    };
  }
}

export default JWTService;
