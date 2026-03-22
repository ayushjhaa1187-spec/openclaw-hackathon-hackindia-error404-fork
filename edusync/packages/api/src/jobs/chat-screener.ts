import { Worker, Job, Queue } from 'bullmq';
import { FlagModel, StudentModel, SwapModel, nexusConnector } from '@edusync/db';
import { GeminiService } from '../modules/nexus/gemini.service.js';
import { NotificationService } from '../modules/notifications/service.js';
import { getIO } from '../../socket.js';

export const chatScreenerQueue = new Queue('chat-screener', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

export const ChatScreenerWorker = new Worker('chat-screener', async (job: Job) => {
  const { content, roomId, swapId, senderUid, campus } = job.data;
  console.log(`🛡️ [ChatScreener] Analyzing message from ${senderUid} in room ${roomId}`);

  try {
    // 1. AI Safety Analysis
    const analysis = await GeminiService.analyzeSafety(content);

    if (analysis.isFlagged) {
      console.warn(`🚨 [ChatScreener] Policy violation detected: ${analysis.reason}`);

      // 2. Create Flag in MongoDB
      const flag = await FlagModel.create({
        flagType: 'chat_message',
        severity: analysis.severity || 'high',
        sourceEntityId: roomId,
        sourceEntityType: 'swap_room',
        involvedUids: [senderUid],
        campus: campus,
        flaggedContent: content,
        detectionMethod: 'gemini_async',
        aiAnalysisReason: analysis.reason,
        status: 'pending'
      });

      // 3. Update Student Flag Count
      await StudentModel.findOneAndUpdate(
        { firebaseUid: senderUid },
        { $inc: { 'moderation.flags': 1 } }
      );

      // 4. Update Swap Session Flags
      await SwapModel.findOneAndUpdate(
         { _id: swapId },
         { $push: { 'sessions.$[].flags': flag._id } }
      );

      // 5. Institutional Notifications (Admins)
      getIO().to(`admin:${campus}`).emit('guardian:flag_raised', {
        flagId: flag._id,
        severity: flag.severity,
        reason: analysis.reason
      });

      // 6. User Warning (Optional based on severity)
      if (flag.severity === 'high' || flag.severity === 'critical') {
        await NotificationService.create(senderUid, 'guardian_warning', {
          swapId: swapId,
          reason: 'Automated safety scan detected potential policy violation.'
        });
      }
    }
  } catch (error) {
    console.error(`❌ [ChatScreener] Analysis failed for job ${job.id}:`, error);
    throw error; // Retry
  }
}, { 
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  } 
});

export function startChatScreenerWorker() {
  console.log('🛡️ Guardian Chat Screener Worker: Online');
}
