import { z } from 'zod';

// Base ID schema for distributed nodes
export const NodeIdSchema = z.string().uuid();

export const CampusSchema = z.enum([
  'IIT_JAMMU',
  'IIT_DELHI',
  'IIT_BOMBAY',
  'IIT_KANPUR',
  'NIT_TRICHY'
]);

export const KARMA_TIERS = {
  bronze:   { min: 0,    max: 499  },
  silver:   { min: 500,  max: 1499 },
  gold:     { min: 1500, max: 4999 },
  platinum: { min: 5000, max: Infinity }
} as const;

export type KarmaTier = keyof typeof KARMA_TIERS;

// Student Profile Schema
export const StudentProfileSchema = z.object({
  firebaseUid: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  campus: CampusSchema,
  specialization: z.string().optional(),
  department: z.string().optional(),
  year: z.number().optional(),
  skills: z.array(z.string()),
  wantToLearn: z.array(z.string()).default([]),
  karma: z.number().default(0),
  karmaRank: z.number().nullable().default(null),
  previousRank: z.number().nullable().default(null),
  rankTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).default('bronze'),
  verifiedInstitutionalId: z.boolean().default(false),
  avatarUrl: z.string().url().optional(),
  nexus: z.object({
    crossCampusEnabled: z.boolean().default(false),
    partnerCampusAccess: z.array(CampusSchema).default([]),
  }).default({ crossCampusEnabled: false, partnerCampusAccess: [] }),
  notificationPreferences: z.object({
    swaps: z.boolean().default(true),
    vault: z.boolean().default(true),
    karma: z.boolean().default(true),
    admin: z.boolean().default(true),
  }).default({ swaps: true, vault: true, karma: true, admin: true }),
  privacySettings: z.object({
    showOnLeaderboard: z.boolean().default(true),
    showKarmaBalance: z.boolean().default(true),
  }).default({ showOnLeaderboard: true, showKarmaBalance: true }),
});

export type LeaderboardStudent = {
  uid: string;
  name: string;
  avatarUrl: string;
  campus: string;
  rankTier: KarmaTier;
  karma: number;
  karmaRank: number | null;
  previousRank: number | null;
  swapsCompleted: number;
};

// Skill Swap Request Schema
export const SkillSwapSchema = z.object({
  requesterUid: z.string(),
  providerUid: z.string(),
  skill: z.string(),
  status: z.enum(['pending', 'accepted', 'active', 'completed', 'canceled', 'disputed']),
  karmaStaked: z.number().min(10),
  exchangeDuration: z.number().optional(), // in minutes
  nodeAffinity: CampusSchema.optional(),
  isCrossCampus: z.boolean().default(false),
  nexusLogId: z.string().optional(),
});

// Transaction Schema for Postgres Ledger
export const KarmaTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  fromUid: z.string(),
  toUid: z.string(),
  amount: z.number(),
  reason: z.string(),
  blockNumber: z.number().optional(),
  institutionalNode: z.string().optional(),
  timestamp: z.date(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type SkillSwap = z.infer<typeof SkillSwapSchema>;
export type KarmaTransaction = z.infer<typeof KarmaTransactionSchema>;

// Security Utilities (AES-256-GCM)
export * from './utils/security';

export const SYSTEM_ACCOUNTS = ['NEXUS_TREASURY', 'KARMA_ESCROW', 'NEXUS_SYSTEM'] as const;
export type SystemAccount = typeof SYSTEM_ACCOUNTS[number];

// High-risk keywords for synchronous chat blocking
export const HIGH_RISK_KEYWORDS = [
  'pay me', 'venmo', 'upi', 'cash app', 'paypal',  // off-platform payment
  'do my assignment', 'write my essay', 'take my exam',  // academic dishonesty
  'whatsapp me', 'telegram me', 'contact outside',  // off-platform contact attempts
] as const;
