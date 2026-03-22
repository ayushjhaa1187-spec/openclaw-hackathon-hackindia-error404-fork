import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CampusSchema } from '@edusync/shared';

// Extends Express Request to include validated student data
declare global {
  namespace Express {
    interface Request {
      student?: {
        uid: string;
        campus: string;
        roles: string[];
      };
    }
  }
}

const NEXUS_SECRET = process.env.NEXUS_JWT_SECRET || 'fallback_secret_for_dev_only';

export const institutionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Node Authorization Handshake' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, NEXUS_SECRET) as any;
    
    // Check if the student's campus node is currently active in the MOU Nexus
    const isCampusValid = CampusSchema.safeParse(decoded.campus);
    if (!isCampusValid.success) {
      return res.status(403).json({ error: 'Campus Institutional Node is not in the Nexus Proxy whitelist.' });
    }

    req.student = {
       uid: decoded.sub || decoded.uid,
       campus: decoded.campus,
       roles: decoded.roles || ['student']
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Nexus Handshake Failure: Invalid or expired institutional identity token.' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.student || !req.student.roles.includes('nexus_admin')) {
    return res.status(403).json({ error: 'Unauthorized: Requires Institutional Admin clearance.' });
  }
  next();
};
