import { nexusConnector } from '@edusync/db';
import { KarmaTransaction } from '@edusync/shared';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../services/redis-service.js';
import { AnalyticsService } from '../analytics/service.js';

export class KarmaService {
  /**
   * Records a Karma transaction in the immutable Postgres Ledger.
   * Atomic, includes validations, and invalidates Redis cache.
   */
  static async recordTransaction(tx: Omit<KarmaTransaction, 'transactionId' | 'timestamp'>) {
    // 1. Validations
    const systemAccounts = ['NEXUS_TREASURY', 'KARMA_ESCROW', 'NEXUS_SYSTEM'];
    const isSystemSender = systemAccounts.includes(tx.fromUid);

    if (tx.amount <= 0) throw new Error('Transaction amount must be positive');
    if (tx.fromUid === tx.toUid && !isSystemSender) throw new Error('Self-transfers are not permitted');
    
    // Inbound to treasury only allowed from authorized system sources
    if (tx.toUid === 'NEXUS_TREASURY' && !isSystemSender) {
        throw new Error('Direct inbound transfers to NEXUS_TREASURY are restricted');
    }

    const client = await nexusConnector.pg.connect();
    try {
      await client.query('BEGIN');
      
      const txId = uuidv4();
      const node = tx.institutionalNode || 'NEXUS_SYSTEM';
      
      const query = `
        INSERT INTO karma_ledger 
        (id, sender_uid, receiver_uid, amount, transaction_reason, institutional_node, digest_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        txId,
        tx.fromUid,
        tx.toUid,
        tx.amount,
        tx.reason,
        node,
        null // digest_hash: Phase 9 enhancement
      ];

      const res = await client.query(query, values);
      await client.query('COMMIT');

      // 2. Invalidate Redis cache for both parties
      await redis.del(`karma:balance:${tx.fromUid}`);
      await redis.del(`karma:balance:${tx.toUid}`);

      // 3. Invalidate analytics cache for the campus
      if (node !== 'NEXUS_SYSTEM') {
        await AnalyticsService.invalidateCache(node);
      }

      return res.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Ledger Transaction Failure:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves student balance using Redis cache (60s TTL).
   * Aggregates from immutable PG ledger on cache miss.
   */
  static async getBalance(uid: string): Promise<number> {
    const cacheKey = `karma:balance:${uid}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached !== null) return parseFloat(cached);
    } catch (err) {
      console.warn('Redis Cache Miss (Error):', err);
    }

    // Ledger source of truth: receiver (credits) - sender (debits)
    const query = `
      SELECT COALESCE(SUM(amount), 0) as balance 
      FROM (
        SELECT amount FROM karma_ledger WHERE receiver_uid = $1
        UNION ALL 
        SELECT -amount FROM karma_ledger WHERE sender_uid = $1
      ) as t
    `;
    
    const res = await nexusConnector.pg.query(query, [uid]);
    const balance = parseFloat(res.rows[0].balance || '0');

    // Update cache
    try {
      await redis.setEx(cacheKey, 60, String(balance));
    } catch (err) {
      console.warn('Redis Cache Update Failure:', err);
    }

    return balance;
  }

  /**
   * Fetches transaction history with cursor-based pagination.
   * Cursor is block_sequence_id to avoid race conditions.
   */
  static async getHistory(uid: string, limit: number = 20, cursor?: number) {
    let query = `
      SELECT * FROM karma_ledger 
      WHERE (sender_uid = $1 OR receiver_uid = $1)
    `;
    const params: any[] = [uid, limit];

    if (cursor) {
      query += ` AND block_sequence_id < $3`;
      params.push(cursor);
    }

    query += ` ORDER BY block_sequence_id DESC LIMIT $2`;

    const res = await nexusConnector.pg.query(query, params);
    return res.rows;
  }
}
