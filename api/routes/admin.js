import express from 'express';

const router = express.Router();

// Get Moderation Queue (Part 7 & Part 10)
router.get('/moderation-queue', (req, res) => {
  res.json([
    { id: 'F-001', type: 'Chat', reason: 'Potential academic dishonesty', confidence: '87%', status: 'pending' },
    { id: 'F-002', type: 'Vault', reason: 'Copyright infringement flag', confidence: '92%', status: 'pending' }
  ]);
});

// System Latency & Node Health (Part 10 Scalability)
router.get('/system-health', (req, res) => {
  res.json({
    nodes: [
      { name: 'IIT Jammu', latency: '12ms', status: 'online' },
      { name: 'IIT Delhi', latency: '45ms', status: 'online' },
      { name: 'MOU Cloud Broker', latency: '8ms', status: 'online' }
    ],
    throughput: '12.4k rps',
    uptime: '99.99%'
  });
});

export default router;
