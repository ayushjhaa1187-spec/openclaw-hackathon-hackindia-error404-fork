import { Queue, Worker, QueueEvents } from 'bullmq';
import { SwapModel } from '@edusync/db';
import { NotificationService } from '../modules/notifications/service.js';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const escrowQueue = new Queue('escrow-watchdog', {
  connection: { host: REDIS_HOST, port: REDIS_PORT }
});

/**
 * Escrow Watchdog Worker
 * Flags swaps that have been 'accepted' but forgotten for > 7 days.
 */
export const startEscrowWatchdogWorker = () => {
  const worker = new Worker('escrow-watchdog', async (job) => {
    console.log('🧐 Escrow Watchdog: Scanning for stale swaps...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleSwaps = await SwapModel.find({
      status: 'accepted',
      updatedAt: { $lt: sevenDaysAgo },
      isStale: { $ne: true }
    });

    console.log(`🧐 Escrow Watchdog: Found ${staleSwaps.length} stale swaps.`);

    for (const swap of staleSwaps) {
      swap.isStale = true;
      await swap.save();
      
      // Notify both parties of administrative flagging
      await NotificationService.create(swap.requesterUid, 'swap_admin_resolved', { 
        swapId: swap._id,
        notes: 'Swap flagged as stale by system watchdog.' 
      });
      await NotificationService.create(swap.providerUid, 'swap_admin_resolved', { 
        swapId: swap._id,
        notes: 'Swap flagged as stale by system watchdog.' 
      });
    }

    return { flagged: staleSwaps.length };
  }, {
    connection: { host: REDIS_HOST, port: REDIS_PORT }
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Escrow Watchdog Job ${job?.id} failed:`, err);
  });
};

/**
 * Register the recurring job
 */
export const registerEscrowWatchdog = async () => {
  // Clear old repeatables to avoid duplication on restart
  const repeatables = await escrowQueue.getRepeatableJobs();
  for (const job of repeatables) {
    await escrowQueue.removeRepeatableByKey(job.key);
  }

  await escrowQueue.add('daily-scan', {}, {
    repeat: { pattern: '0 0 * * *' } // Every night at midnight
  });
  
  console.log('✅ Escrow Watchdog: Daily scan registered.');
};
