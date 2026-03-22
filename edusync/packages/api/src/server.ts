import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { nexusConnector } from '@edusync/db';
import router from './router.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { initSocket } from './socket.js';
import { registerEscrowWatchdog, startEscrowWatchdogWorker } from './jobs/escrow-watchdog.js';
import { registerLeaderboardRefresh, startLeaderboardRefreshWorker } from './jobs/leaderboard-refresh.js';
import { startResourceScreenerWorker } from './jobs/resource-screener.js';
import { startChatScreenerWorker } from './jobs/chat-screener.js';
import { registerAnalyticsSnapshotJob, AnalyticsSnapshotWorker } from './jobs/analytics-snapshot.js';
import { reportWorker } from './modules/analytics/export.service.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Attach Nexus Router
app.use('/api/v1', router);

import { HIGH_RISK_KEYWORDS } from '@edusync/shared';
import { chatScreenerQueue } from './jobs/chat-screener.js';
import { FlagModel, StudentModel } from '@edusync/db';

// Socket.io Peer Sync Handlers with Integrated Guardian AI Pipeline
io.on('connection', (socket) => {
  console.log(`🛡️ Nexus Node: Authenticated Peer [${socket.data.uid}] @ [${socket.data.campus}]`);
  
  socket.on('sync-message', async (data) => {
    const { content, roomId, swapId } = data;
    const senderUid = socket.data.uid;
    const campus = socket.data.campus;

    // --- PHASE 1: Synchronous Keyword Pre-filter (Option C) ---
    const contentLower = content.toLowerCase();
    const blockedKeyword = HIGH_RISK_KEYWORDS.find(kw => contentLower.includes(kw));

    if (blockedKeyword) {
      console.warn(`🛑 [Guardian-Sync] Blocked high-risk keyword "${blockedKeyword}" from ${senderUid}`);
      
      // 1. Create immediate Block Flag
      const flag = await FlagModel.create({
        flagType: 'chat_message',
        severity: 'critical',
        sourceEntityId: roomId,
        sourceEntityType: 'swap_room',
        involvedUids: [senderUid],
        campus,
        flaggedContent: content,
        flagCategories: ['inappropriate_content'],
        detectionMethod: 'keyword_sync',
        status: 'pending'
      });

      // 2. Increment student flag count
      await StudentModel.findOneAndUpdate(
        { firebaseUid: senderUid },
        { $inc: { 'moderation.flags': 1 } }
      );

      // 3. Notify Sender (Immediate Feedback)
      socket.emit('message_blocked', { 
        reason: 'Policy Violation', 
        details: 'Institutional security protocols blocked this message due to high-risk content.' 
      });

      // 4. Alert Admins (Real-time)
      io.to(`admin:${campus}`).emit('guardian:flag_raised', {
        flagId: flag._id,
        severity: 'critical',
        detectionMethod: 'keyword_sync',
        senderUid
      });

      return; // Stop delivery
    }

    // --- PHASE 2: Clean Message Delivery ---
    // Delivery is immediate for clean messages (zero perceived latency)
    io.to(roomId).emit('message', {
      ...data,
      senderUid,
      timestamp: new Date().toISOString()
    });

    // --- PHASE 3: Asynchronous AI Screening ---
    await chatScreenerQueue.add(`${roomId}:${Date.now()}`, {
      content,
      roomId,
      swapId,
      senderUid,
      campus
    }, {
      removeOnComplete: true,
      attempts: 3
    });
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('join-user-room', (uid: string) => {
    // Only allow joining own user room
    if (uid === socket.data.uid) {
      socket.join(`user:${uid}`);
    }
  });

  socket.on('join-admin-room', (campus: string) => {
    // Role-based access (campus-locked)
    if (socket.data.roles?.includes('nexus_admin') && socket.data.campus === campus) {
      console.log(`🛡️ Admin joined campus room: admin:${campus}`);
      socket.join(`admin:${campus}`);
    }
  });
});

const PORT = process.env.PORT || 3001;

async function startNode() {
  try {
    await nexusConnector.connectNode();
    
    // Initialize AI & Escrow Workers (BullMQ)
    try {
      startEscrowWatchdogWorker();
      await registerEscrowWatchdog();
      
      startLeaderboardRefreshWorker();
      await registerLeaderboardRefresh();

      startResourceScreenerWorker();
      startChatScreenerWorker();
      console.log('✅ Resource & Chat Screener Workers: Online');
      
      await registerAnalyticsSnapshotJob();
      // Worker is initialized on file import, but we can log its status
      console.log('✅ Analytics Snapshot Worker: Online');
    } catch (redisErr) {
      console.warn('⚠️ Redis or BullMQ not available. Background jobs offline.', redisErr);
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 EduSync Nexus API Node running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal Node Start Error:', error);
    process.exit(1);
  }
}

startNode();
