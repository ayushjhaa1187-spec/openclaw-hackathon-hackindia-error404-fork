import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connections
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/edusync_nexus';
    await mongoose.connect(mongoUri);
    console.log('MongoDB: Connected Successfully to Atlas/Nexus Node');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
};

const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL
});
pgPool.on('connect', () => console.log('PostgreSQL: Connected to Karma Ledger'));
pgPool.on('error', (err) => console.error('PostgreSQL Pool Error:', err));

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected to Nexus Bridge:', socket.id);
  
  socket.on('join_collab', (roomId) => {
    socket.join(roomId);
    console.log(`User joint Collab Room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // Part 7: Guardian AI Moderation Pipeline Simulation
    const { content, roomId } = data;
    if (content.toLowerCase().includes('money') || content.toLowerCase().includes('payment')) {
      io.to(roomId).emit('moderation_alert', { 
        type: 'warning', 
        message: 'Guardian AI: Contextual policy violation flagged. Interaction logged for Campus Admin.' 
      });
    }
    io.to(roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from Nexus');
  });
});

// Routes
import authRoutes from './routes/auth.js';
import karmaRoutes from './routes/karma.js';
import skillRoutes from './routes/skills.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authRoutes);
app.use('/api/karma', karmaRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Nexus Online', version: '4.0.0-MarketReady' });
});

// Import and use feature-specific routes (to be created)
// import authRoutes from './routes/auth.js';
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, () => {
    console.log(`EduSync Market-Ready Server running on port ${PORT}`);
  });
}
connectDB();

export default app;
