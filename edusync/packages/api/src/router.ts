import { Router, Request, Response } from 'express';
import { institutionalAuth, adminOnly } from './middleware/auth';
import { KarmaService } from './modules/karma/service';
import { listSkills, proposeSwap, updateProfile, getProfile } from './modules/skill/controller';
import { listResources, uploadResource, purchaseResource } from './modules/vault/controller';
import { getSystemStats, getModerationQueue, resolveFlag } from './modules/admin/controller';

const router = Router();

// Public Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Nexus Node Active', timestamp: new Date() });
});

// Profile & Skill Nexus
router.get('/skills', listSkills);
router.get('/profile/:id', getProfile);
router.post('/profile/sync', institutionalAuth, updateProfile);
router.post('/swaps/propose', institutionalAuth, proposeSwap);

// Karma Ledger (Immutable)
router.get('/karma/balance', institutionalAuth, async (req: Request, res: Response) => {
  try {
    const balance = await KarmaService.getBalance(req.student!.uid);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: 'Ledger Unreachable' });
  }
});

// Knowledge Vault
router.get('/vault', listResources);
router.post('/vault/upload', institutionalAuth, uploadResource);
router.post('/vault/purchase/:resourceId', institutionalAuth, purchaseResource);

// Institutional Admin Hub (Guardian Protocol)
router.get('/admin/stats', institutionalAuth, adminOnly, getSystemStats);
router.get('/admin/queue', institutionalAuth, adminOnly, getModerationQueue);
router.post('/admin/resolve', institutionalAuth, adminOnly, resolveFlag);

export default router;
