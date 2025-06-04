import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const redisHost = process.env.AZURE_MANAGED_REDIS_HOST_NAME;
const redisAccessKey = process.env.AZURE_MANAGED_REDIS_ACCESS_KEY

if (!redisHost) throw new Error("REDIS_HOST is not defined in .env");
if (!redisAccessKey) throw new Error("REDIS_ACCESS_KEY is not defined in .env");

// Build the Redis connection URL with TLS
const redisUrl = `rediss://${redisHost}:6380`;

// Create Redis client using connection string and password
const redisClient = createClient({
  url: redisUrl,
  password: redisAccessKey,
});

// Handle errors with Redis client
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Optional: Reconnect on end
redisClient.on('end', () => {
  console.warn('Redis connection ended. Attempting reconnect...');
  setTimeout(() => {
    redisClient.connect().catch(console.error);
  }, 5000);
});

// Connect to Redis
redisClient.connect()
  .then(() => {
    console.log('✅ Connected to Redis');
    return redisClient.ping();
  })
  .then((pingResponse) => {
    console.log('Redis Ping Response:', pingResponse);  // Should be 'PONG'
  })
  .catch((err) => {
    console.error('Redis Connection Error:', err);
  });

// Gracefully handle process exit
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis connection closed');
  process.exit();
});

// Export the client for use elsewhere
export default redisClient;
