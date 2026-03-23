import { StudentModel } from '@edusync/db';

/**
 * PHASE 9 HARDENED SCORING SERVICE
 * 
 * Weighted scoring algorithm with locked invariants.
 * Transforms raw search hits into ranked recommendations.
 * 
 * FORMULA (LOCKED):
 *   score = (relevance × 0.50) + (reputation × 0.30) + (proximity × 0.20)
 * 
 * INVARIANTS (TESTED):
 *   - Weights sum to exactly 1.0
 *   - Each component is normalized to [0, 1]
 *   - Final score is always in [0, 1]
 *   - Same campus proximity (1.0) > Nexus (0.4) > None (0.0)
 *   - Diamond tier (1.0) > Silver (0.5) > Bronze (0.2)
 */

// Locked weights (change requires explicit code review + test update)
const SCORING_WEIGHTS = {
  RELEVANCE: 0.50,  // Meilisearch text match quality
  REPUTATION: 0.30, // Karma + tier
  PROXIMITY: 0.20,  // Campus relationship
} as const;

// Enforce invariant at module load time
const WEIGHT_SUM = SCORING_WEIGHTS.RELEVANCE + SCORING_WEIGHTS.REPUTATION + SCORING_WEIGHTS.PROXIMITY;
if (Math.abs(WEIGHT_SUM - 1.0) > 0.001) {
  throw new Error(`CRITICAL: Weights must sum to 1.0, got ${WEIGHT_SUM}`);
}

export class ScoringService {
  /**
   * Score a single candidate for discovery ranking.
   * 
   * @param hit Raw Meilisearch/MongoDB hit with _rankingScore, karma, rankTier, campusId
   * @param requester Requester student context (campusId, nexus partners)
   * @returns Final score in [0, 1]
   */
  static scoreCandidate(
    hit: any,
    requester: any
  ): number {
    // Phase 9 Security: Handle unauthenticated/public search
    if (!requester) {
      // For public discovery, just return reputation + relevance
      const relevance = Math.min(Math.max(hit._rankingScore || 0.5, 0), 1.0);
      const reputation = this.getReputationScore(hit.karma || 0, hit.rankTier || 'bronze');
      return relevance * SCORING_WEIGHTS.RELEVANCE + reputation * SCORING_WEIGHTS.REPUTATION;
    }

    // Invariant: can't score self
    if (hit.firebaseUid === requester.uid || hit.firebaseUid === (requester.firebaseUid || requester.uid)) return 0;

    // Invariant: exclude banned students
    const bannedStatuses = ['suspended', 'banned'];
    if (bannedStatuses.includes(hit.moderationStatus) || bannedStatuses.includes(hit.status)) return 0;

    // Component 1: Relevance (already normalized by Meilisearch or MongoDB regex score)
    const relevanceScore = Math.min(Math.max(hit._rankingScore || 0.5, 0), 1.0);

    // Component 2: Reputation (normalize karma + tier to [0, 1])
    const reputationScore = this.getReputationScore(hit.karma || 0, hit.rankTier || 'bronze');

    // Component 3: Proximity (campus relationship)
    const proximityScore = this.getProximityScore(
      requester.campusId,
      requester.partnerCampuses || [],
      hit.campusId
    );

    // Compute weighted score
    const finalScore =
      relevanceScore * SCORING_WEIGHTS.RELEVANCE +
      reputationScore * SCORING_WEIGHTS.REPUTATION +
      proximityScore * SCORING_WEIGHTS.PROXIMITY;

    // Enforce invariant: score must be [0, 1]
    return Math.min(Math.max(finalScore, 0), 1.0);
  }

  /**
   * Batch scoring for efficiency (Phase 9 requirement)
   */
  static scoreBatch(hits: any[], requester: any): any[] {
    return hits.map(hit => ({
      ...hit,
      matchScore: this.scoreCandidate(hit, requester),
      scoreBreakdown: this.getScoreBreakdown(hit, requester)
    })).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Get detailed score breakdown for transparency.
   * Used in API response so admins/developers can debug ranking.
   */
  static getScoreBreakdown(
    hit: any,
    requester: any
  ): {
    relevance: number;
    reputation: number;
    proximity: number;
    tierLabel: string;
    proximityLabel: string;
  } {
    const relevance = Math.min(Math.max(hit._rankingScore || 0.5, 0), 1.0);
    const reputation = this.getReputationScore(hit.karma || 0, hit.rankTier || 'bronze');
    
    // Phase 9 Security: Default proximity for unauthenticated users
    const requesterCampus = requester?.campusId || '';
    const partnerCampuses = requester?.partnerCampuses || [];

    const proximity = this.getProximityScore(
      requesterCampus,
      partnerCampuses,
      hit.campusId
    );

    return {
      relevance,
      reputation,
      proximity,
      tierLabel: this.getTierLabel(hit.rankTier || 'bronze'),
      proximityLabel: this.getProximityLabel(
        requesterCampus,
        partnerCampuses,
        hit.campusId
      ),
    };
  }

  /**
   * Reputation score: tier + karma bonus
   * Bronze (0.2) < Silver (0.5) < Gold (0.75) < Diamond (1.0)
   */
  private static getReputationScore(karma: number, rankTier: string): number {
    const tierScores: Record<string, number> = {
      bronze: 0.2,
      silver: 0.5,
      gold: 0.75,
      diamond: 1.0,
    };

    const tierScore = tierScores[rankTier.toLowerCase()] ?? 0.2;

    // Bonus: high karma within tier ranks higher (capped at +0.2)
    const karmaBonus = Math.min(karma / 5000, 0.2);

    return Math.min(tierScore + karmaBonus, 1.0);
  }

  /**
   * Proximity score: same campus > nexus partner > no link
   */
  private static getProximityScore(
    requesterCampus: string,
    partnerCampuses: string[],
    candidateCampus: string
  ): number {
    if (requesterCampus === candidateCampus) return 1.0; 
    if (Object.values(partnerCampuses).includes(candidateCampus)) return 0.4;
    return 0.0;
  }

  private static getTierLabel(tier: string): string {
    const labels: Record<string, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };
    return labels[tier.toLowerCase()] ?? 'Unknown';
  }

  private static getProximityLabel(
    requesterCampus: string,
    partnerCampuses: string[],
    candidateCampus: string
  ): string {
    if (requesterCampus === candidateCampus) return 'Same campus';
    if (Object.values(partnerCampuses).includes(candidateCampus)) return 'Nexus partner';
    return 'No direct link';
  }
}
