import { Router, Request, Response } from 'express';
import { VaultController } from './modules/vault/controller.js';
import * as AdminController from './modules/admin/controller.js';
import * as SkillController from './modules/skill/controller.js';
import * as KarmaController from './modules/karma/controller.js';
import { SwapController } from './modules/swap/controller.js';
import { NotificationController } from './modules/notifications/controller.js';
import { LeaderboardController } from './modules/leaderboard/controller.js';
import { NexusController } from './modules/nexus/controller.js';
import { SettingsController } from './modules/student/settings-controller.js';
import { VerificationController } from './modules/admin/verification.controller.js';
import { AnalyticsController } from './modules/analytics/controller.js';
import { GuardianController } from './modules/guardian/controller.js';
import { StudentDetailController } from './modules/admin/student-detail.controller.js';
import { CampusSettingsController } from './modules/admin/campus-settings.controller.js';
import { institutionalAuth, adminOnly } from './middleware/auth.js';
import { nexusGuard } from './middleware/nexus-guard.js';
import { KarmaService } from './modules/karma/service.js';

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// --- Nexus Vault Infrastructure ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'video/mp4', 'image/jpeg', 'image/png', 'application/zip'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: Nexus Vault accepts PDF, MP4, JPEG, PNG, or ZIP only.'));
    }
  }
});

// Public Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Nexus Node Active', timestamp: new Date() });
});

// Profile & Skill Nexus
router.get('/skills', SkillController.listSkills);
router.get('/profile/:id', SkillController.getProfile);
router.post('/profile/sync', institutionalAuth, SkillController.updateProfile);

// Cross-Campus Nexus Discovery
router.get('/nexus/explore', institutionalAuth, nexusGuard, NexusController.getCrossCampusExplore);
router.get('/nexus/partners', institutionalAuth, nexusGuard, NexusController.getActiveMOUPartners);
router.get('/nexus/profile/:uid', institutionalAuth, nexusGuard, NexusController.getCrossCampusProfile);

// Institutional Settings (S20)
router.patch('/settings/nexus', institutionalAuth, SettingsController.updateNexusSettings);
router.patch('/settings/notifications', institutionalAuth, SettingsController.updateNotificationPreferences);
router.patch('/settings/privacy', institutionalAuth, SettingsController.updatePrivacySettings);

// Knowledge Vault
router.get('/vault/search/ai', institutionalAuth, VaultController.semanticSearch);
router.get('/vault', VaultController.listResources);
router.get('/vault/:id', VaultController.getResource);
router.post('/vault/upload', institutionalAuth, upload.single('file'), VaultController.uploadResource);
router.post('/vault/purchase/:resourceId', institutionalAuth, VaultController.purchaseResource);
router.post('/vault/resubmit/:id', institutionalAuth, VaultController.resubmitResource);

// Institutional Admin Hub (Guardian Protocol / Resource Verification)
router.get('/admin/verify/queue', institutionalAuth, adminOnly, VerificationController.getQueue);
router.post('/admin/verify/:id/review', institutionalAuth, adminOnly, VerificationController.openReview);
router.post('/admin/verify/:id/approve', institutionalAuth, adminOnly, VerificationController.approve);
router.post('/admin/verify/:id/reject', institutionalAuth, adminOnly, VerificationController.reject);
router.post('/admin/verify/:id/request-changes', institutionalAuth, adminOnly, VerificationController.requestChanges);
router.get('/admin/verify/audit', institutionalAuth, adminOnly, VerificationController.getAuditLog);

// Karma Nexus Ledger
router.get('/karma/balance', institutionalAuth, KarmaController.getBalance);
router.get('/karma/history', institutionalAuth, KarmaController.getHistory);

// Analytics Dashboard (S26)
router.get('/admin/analytics/overview', institutionalAuth, adminOnly, AnalyticsController.getOverview);
router.get('/admin/analytics/trends', institutionalAuth, adminOnly, AnalyticsController.getTrends);
router.get('/admin/analytics/karma', institutionalAuth, adminOnly, AnalyticsController.getKarmaFlow);
router.post('/admin/analytics/export', institutionalAuth, adminOnly, AnalyticsController.exportROI);

// --- GUARDIAN AI MONITOR (S27) ---
router.get('/admin/guardian/flags', institutionalAuth, adminOnly, GuardianController.getQueue);
router.get('/admin/guardian/flags/:id', institutionalAuth, adminOnly, GuardianController.getDetails);
router.post('/admin/guardian/flags/:id/resolve', institutionalAuth, adminOnly, GuardianController.resolve);
router.post('/admin/guardian/flags/:id/undo', institutionalAuth, adminOnly, GuardianController.undo);
router.get('/admin/guardian/stats', institutionalAuth, adminOnly, GuardianController.getStats);

// --- Student Detail & Moderation (S23) ---
router.get('/admin/students/:uid/swaps', institutionalAuth, adminOnly, StudentDetailController.getStudentSwapHistory);
router.get('/admin/students/:uid/flags', institutionalAuth, adminOnly, StudentDetailController.getStudentFlagHistory);
router.patch('/admin/students/:uid/moderation', institutionalAuth, adminOnly, StudentDetailController.updateModerationStatus);
router.patch('/admin/students/:uid/clear-record', institutionalAuth, adminOnly, StudentDetailController.clearStudentRecord);
router.get('/admin/students/:uid', institutionalAuth, adminOnly, StudentDetailController.getStudentDetail);

// --- Campus Settings & Admin Management (S28) ---
router.get('/admin/settings/admins', institutionalAuth, adminOnly, CampusSettingsController.getAdminUsers);
router.post('/admin/settings/admins', institutionalAuth, adminOnly, CampusSettingsController.addAdminUser);
router.delete('/admin/settings/admins/:uid', institutionalAuth, adminOnly, CampusSettingsController.removeAdminUser);
router.patch('/admin/settings/nexus', institutionalAuth, adminOnly, CampusSettingsController.updateNexusSettings);
router.patch('/admin/settings/guardian', institutionalAuth, adminOnly, CampusSettingsController.updateGuardianSettings);
router.patch('/admin/settings/karma', institutionalAuth, adminOnly, CampusSettingsController.updateKarmaSettings);
router.get('/admin/settings', institutionalAuth, adminOnly, CampusSettingsController.getSettings);


// Student Reporting
router.post('/guardian/report', institutionalAuth, GuardianController.report);

// Leaderboard Status
router.get('/leaderboard/global', institutionalAuth, LeaderboardController.getGlobalLeaderboard);
router.get('/leaderboard/me', institutionalAuth, LeaderboardController.getMyRank);
router.get('/leaderboard', institutionalAuth, LeaderboardController.getCampusLeaderboard);

// --- SKILL SWAP ENGINE ---
router.post('/swaps/propose', institutionalAuth, SwapController.proposeSwap);
router.patch('/swaps/:id/accept', institutionalAuth, SwapController.acceptSwap);
router.patch('/swaps/:id/reject', institutionalAuth, SwapController.rejectSwap);
router.patch('/swaps/:id/complete', institutionalAuth, SwapController.completeSwap);
router.patch('/swaps/:id/request-cancel', institutionalAuth, SwapController.requestCancel);
router.patch('/swaps/:id/admin-override', institutionalAuth, SwapController.adminOverride);
router.get('/swaps', institutionalAuth, SwapController.getSwaps);
router.get('/swaps/:id', institutionalAuth, SwapController.getSwapById);

// AI Genesis Endpoints
router.post('/ai/enhance', institutionalAuth, SkillController.enhanceDescription);
router.post('/ai/match', institutionalAuth, SkillController.getSemanticMatches);

// --- NOTIFICATIONS HUB ---
router.patch('/notifications/read-all', institutionalAuth, NotificationController.markAllRead);
router.patch('/notifications/:id/read', institutionalAuth, NotificationController.markRead);
router.get('/notifications', institutionalAuth, NotificationController.getNotifications);

export default router;
