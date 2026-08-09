import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'abcdefg',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    redisConfig: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retryAttempts: 3,
        retryDelay: 1000,
    }
};