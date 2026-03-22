import { Router, Request, Response } from 'express';
import * as VaultController from './modules/vault/controller.js';
import * as AdminController from './modules/admin/controller.js';
import { institutionalAuth, adminOnly } from './middleware/auth.js';
import { KarmaService } from './modules/karma/service.js';

const router = Router();

// Public Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Nexus Node Active', timestamp: new Date() });
});

// Profile & Skill Nexus
router.get('/skills', SkillController.listSkills);
router.get('/profile/:id', SkillController.getProfile);
router.post('/profile/sync', institutionalAuth, SkillController.updateProfile);
router.post('/swaps/propose', institutionalAuth, SkillController.proposeSwap);

// Knowledge Vault
router.get('/vault', VaultController.listResources);
router.post('/vault/upload', institutionalAuth, VaultController.uploadResource);
router.post('/vault/purchase/:resourceId', institutionalAuth, VaultController.purchaseResource);

// Institutional Admin Hub (Guardian Protocol)
router.get('/admin/stats', institutionalAuth, adminOnly, AdminController.getSystemStats);
router.get('/admin/queue', institutionalAuth, adminOnly, AdminController.getModerationQueue);
router.post('/admin/resolve', institutionalAuth, adminOnly, AdminController.resolveFlag);
router.post('/admin/audit', institutionalAuth, adminOnly, AdminController.runSafetyAudit);

// AI Genesis Endpoints
router.post('/ai/enhance', institutionalAuth, SkillController.enhanceDescription);
router.post('/ai/match', institutionalAuth, SkillController.getSemanticMatches);

export default router;
