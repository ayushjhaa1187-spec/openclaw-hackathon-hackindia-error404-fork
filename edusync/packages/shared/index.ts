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

// Student Profile Schema
export const StudentProfileSchema = z.object({
  firebaseUid: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  campus: CampusSchema,
  specialization: z.string().optional(),
  skills: z.array(z.string()),
  karma: z.number().default(0),
  verifiedInstitutionalId: z.boolean().default(false),
  avatarUrl: z.string().url().optional(),
});

// Skill Swap Request Schema
export const SkillSwapSchema = z.object({
  requesterUid: z.string(),
  providerUid: z.string(),
  skill: z.string(),
  status: z.enum(['pending', 'accepted', 'active', 'completed', 'canceled']),
  karmaStaked: z.number().min(10),
  exchangeDuration: z.number().optional(), // in minutes
  nodeAffinity: CampusSchema.optional(),
});

// Transaction Schema for Postgres Ledger
export const KarmaTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  fromUid: z.string(),
  toUid: z.string(),
  amount: z.number(),
  reason: z.string(),
  blockNumber: z.number().optional(), // For future blockchain anchoring
  timestamp: z.date(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type SkillSwap = z.infer<typeof SkillSwapSchema>;
export type KarmaTransaction = z.infer<typeof KarmaTransactionSchema>;
