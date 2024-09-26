import { createClient, RedisClientType } from 'redis';

// Create a Redis client
const client: RedisClientType = createClient({
  url: 'redis://127.0.0.1:6379', // Using the URL format is preferred
});

// Connect to Redis
client.on('connect', () => {
  console.log('Client connected to Redis...');
});

client.on('ready', () => {
  console.log('Client connected to Redis and ready to use...');
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('end', () => {
  console.log('Client disconnected from Redis');
});

// Handle process termination
process.on('SIGINT', async () => {
  await client.quit();
});

// Export the Redis client
export default client;

export const setData = async (key: string, value: string, expiration: number) => {
    try {
      await client.set(key, value, { EX: expiration });
      console.log(`Data set: ${key} = ${value} (expires in ${expiration} seconds)`);
    } catch (err) {
      console.error('Error setting data in Redis:', err);
    }
  };

export const getData = async (key: string) => {
    try {
      const value = await client.get(key);
      if (value !== null) {
        console.log(`Data retrieved: ${key} = ${value}`);
        return value;
      } else {
        console.log(`No data found for key: ${key}`);
        return null;
      }
    } catch (err) {
      console.error('Error getting data from Redis:', err);
      return null;
    }
  };
