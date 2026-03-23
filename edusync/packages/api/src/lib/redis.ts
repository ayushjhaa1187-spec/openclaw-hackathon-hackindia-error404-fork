import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err: any) => console.error('Redis Client Error', err));

redis.connect().catch(console.error);

export default redis;
