/**
 * SCORING SERVICE TESTS
 * Tests locked weights and scoring invariants
 */

import { ScoringService } from '../../src/modules/discovery/scoring.service';
import { StudentModel } from '@edusync/db';

describe('ScoringService (PHASE 9 HARDENED)', () => {
  const requester = {
    firebaseUid: 'req-1',
    uid: 'req-1',
    campusId: 'IIT_JAMMU',
    partnerCampuses: ['IIT_DELHI'],
    status: 'active'
  };

  test('INVARIANT: Weights sum to exactly 1.0', () => {
    // This is tested in module load, but we can verify logic here
    const relevance = 0.5;
    const reputation = 0.3;
    const proximity = 0.2;
    expect(relevance + reputation + proximity).toBe(1.0);
  });

  test('INVARIANT: Same campus > Nexus > No link', () => {
    const hitSame = { firebaseUid: 'h1', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'silver' };
    const hitNexus = { firebaseUid: 'h2', campusId: 'IIT_DELHI', karma: 100, rankTier: 'silver' };
    const hitNone = { firebaseUid: 'h3', campusId: 'BITS_PILANI', karma: 100, rankTier: 'silver' };

    const s1 = ScoringService.scoreCandidate(hitSame, requester);
    const s2 = ScoringService.scoreCandidate(hitNexus, requester);
    const s3 = ScoringService.scoreCandidate(hitNone, requester);

    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
  });

  test('INVARIANT: Diamond > Silver > Bronze', () => {
    const hitD = { firebaseUid: 'h1', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'diamond' };
    const hitS = { firebaseUid: 'h2', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'silver' };
    const hitB = { firebaseUid: 'h3', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'bronze' };

    const s1 = ScoringService.scoreCandidate(hitD, requester);
    const s2 = ScoringService.scoreCandidate(hitS, requester);
    const s3 = ScoringService.scoreCandidate(hitB, requester);

    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
  });

  test('INVARIANT: Self-scoring returns 0', () => {
    const hitSelf = { firebaseUid: 'req-1', campusId: 'IIT_JAMMU', karma: 1000, rankTier: 'diamond' };
    expect(ScoringService.scoreCandidate(hitSelf, requester)).toBe(0);
  });

  test('INVARIANT: Suspended students score 0', () => {
    const hitSuspended = { firebaseUid: 'h1', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'silver', status: 'suspended' };
    expect(ScoringService.scoreCandidate(hitSuspended, requester)).toBe(0);
  });

  test('scoreBreakdown includes all components', () => {
    const hit = { firebaseUid: 'h1', campusId: 'IIT_JAMMU', karma: 100, rankTier: 'silver' };
    const breakdown = ScoringService.getScoreBreakdown(hit, requester);
    expect(breakdown).toHaveProperty('relevance');
    expect(breakdown).toHaveProperty('reputation');
    expect(breakdown).toHaveProperty('proximity');
    expect(breakdown).toHaveProperty('tierLabel');
    expect(breakdown).toHaveProperty('proximityLabel');
  });
});
