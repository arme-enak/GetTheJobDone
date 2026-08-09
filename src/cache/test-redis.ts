import redisClient from './client';

async function testRedis() {
    try {
        await redisClient.connect();
        // console.log('✅ Connected!');

        // await redisClient.set('test-key', 'Hello from GetTheJobDone!');
        // console.log('✅ Set value');

        // const value = await redisClient.get('test-key');
        // console.log('📦 Value from Redis:', value);

        // const clients = await redisClient.sendCommand(['CLIENT', 'LIST']);
        // console.log('📋 Connected clients:', clients);
        // OR
        // const info = await redisClient.info('clients');
        // console.log('📊 Client info:', info);

        await redisClient.quit();
        // console.log('✅ Disconnected');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRedis();