import { createClient } from 'redis';
import { config } from '../config';

const redisClient = createClient({
    url: config.redisConfig.url,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > config.redisConfig.retryAttempts) {
                return new Error('Redis connection failed');
            }
            return Math.min(retries * 1000, 3000);
        }
    }
});

redisClient.on('connect', () => {
    console.log('✅ Redis client connected successfully!');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err);
});

redisClient.on('end', () => {
    console.log('🔌 Redis client disconnected');
});

redisClient.connect().catch((err) => {
    console.error('❌ Failed to connect to Redis:', err);
});

export default redisClient;