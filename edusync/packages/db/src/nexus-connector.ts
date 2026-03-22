import mongoose from 'mongoose';
import { Pool } from 'pg';

// Nexus Configuration for Institutional Nodes
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edusync_nexus_social';
const POSTGRES_CONFIG = {
  user: process.env.POSTGRES_USER || 'edusync_admin',
  password: process.env.POSTGRES_PASSWORD || 'nexus_secure_pwd',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'edusync_ledger',
};

// Global Connection Registry for the Monorepo Node
class NexusNodeDB {
  private static instance: NexusNodeDB;
  private mongoConn: typeof mongoose | null = null;
  private pgPool: Pool | null = null;

  private constructor() {}

  public static getInstance(): NexusNodeDB {
    if (!NexusNodeDB.instance) {
      NexusNodeDB.instance = new NexusNodeDB();
    }
    return NexusNodeDB.instance;
  }

  // Multi-Campus Federated Node Connectivity
  public async connectNode(): Promise<void> {
    try {
      // Connect to the High Volume Social Data Node (MongoDB)
      if (!this.mongoConn) {
        this.mongoConn = await mongoose.connect(MONGO_URI);
        console.log('✅ Nexus-Node-Social: MongoDB Handshake successful.');
      }

      // Connect to the Immutable Transaction Ledger Node (PostgreSQL)
      if (!this.pgPool) {
        this.pgPool = new Pool(POSTGRES_CONFIG);
        await this.pgPool.query('SELECT NOW()'); // Verify handshake
        console.log('✅ Nexus-Node-Ledger: PostgreSQL Immutable Ledger connected.');
      }
    } catch (error) {
      console.error('❌ Nexus Node Handshake FAILURE: Fatal Institutional Connectivity Error.', error);
      throw new Error('Federated Node Shutdown: Critical infrastructure timeout.');
    }
  }

  public get pg(): Pool {
    if (!this.pgPool) throw new Error('Nexus Ledger Pool not initialized');
    return this.pgPool;
  }

  public get mongo(): typeof mongoose {
    if (!this.mongoConn) throw new Error('Nexus Social Hub not initialized');
    return this.mongoConn;
  }
}

export const nexusConnector = NexusNodeDB.getInstance();
