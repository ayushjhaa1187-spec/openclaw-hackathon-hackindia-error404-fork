import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { nexusConnector } from '@edusync/db';
import router from './router';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Attach Nexus Router
app.use('/api/v1', router);

// Socket.io Peer Sync Handlers
io.on('connection', (socket) => {
  console.log('Nexus Node: Peer Connected', socket.id);
  
  socket.on('sync-message', (data) => {
    // Broadcast message to specific room (swap session)
    io.to(data.roomId).emit('message', data);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
});

const PORT = process.env.PORT || 3001;

async function startNode() {
  try {
    await nexusConnector.connectNode();
    httpServer.listen(PORT, () => {
      console.log(`🚀 EduSync Nexus API Node running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal Node Start Error:', error);
    process.exit(1);
  }
}

startNode();
