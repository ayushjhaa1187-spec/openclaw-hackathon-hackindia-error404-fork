import { nexusConnector } from '@edusync/db';
import { KarmaTransaction } from '@edusync/shared';
import { v4 as uuidv4 } from 'uuid';

export class KarmaService {
  /**
   * Records a Karma transaction in the immutable Postgres Ledger.
   * This ensures institutional auditability across the Nexus.
   */
  static async recordTransaction(tx: Omit<KarmaTransaction, 'transactionId' | 'timestamp'>) {
    const client = await nexusConnector.pg.connect();
    try {
      await client.query('BEGIN');
      
      const txId = uuidv4();
      const query = `
        INSERT INTO karma_ledger 
        (id, sender_uid, receiver_uid, amount, transaction_reason, institutional_node)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        txId,
        tx.fromUid,
        tx.toUid,
        tx.amount,
        tx.reason,
        'IIT_JAMMU' // Current Node Context
      ];

      const res = await client.query(query, values);
      
      // Atomic Update: We would also update the Mongoose totals here for caching
      // But for POC, we'll rely on the ledger as source of truth.
      
      await client.query('COMMIT');
      return res.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Ledger Transaction Failure:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBalance(uid: string) {
    const res = await nexusConnector.pg.query(
      'SELECT SUM(amount) as balance FROM (SELECT amount FROM karma_ledger WHERE receiver_uid = $1 UNION ALL SELECT -amount FROM karma_ledger WHERE sender_uid = $1) as t',
      [uid]
    );
    return parseFloat(res.rows[0].balance || '0');
  }
}
