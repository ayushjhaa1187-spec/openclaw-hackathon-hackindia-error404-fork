import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { CampusSchema } from '@edusync/shared';

let io: Server;
const NEXUS_SECRET = process.env.NEXUS_JWT_SECRET || 'fallback_secret_for_dev_only';

export function initSocket(httpServer: ReturnType<typeof createServer>) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // Institutional Auth Middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Nexus Socket Error: Missing Identity Token'));
    }

    try {
      const decoded = jwt.verify(token, NEXUS_SECRET) as any;
      const campusRes = CampusSchema.safeParse(decoded.campus);
      
      if (!campusRes.success) {
        return next(new Error('Nexus Socket Error: Invalid Institutional Node'));
      }

      socket.data = {
        uid: decoded.sub || decoded.uid,
        campus: decoded.campus,
        roles: decoded.roles || ['student']
      };
      
      next();
    } catch (err) {
      next(new Error('Nexus Socket Error: Invalid or Expired Token'));
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
  }
  return io;
}
