// redisClient.js
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Validate required environment variables
const redisHost = process.env.AZURE_MANAGED_REDIS_HOST_NAME;
const redisAccessKey = process.env.AZURE_MANAGED_REDIS_ACCESS_KEY;

if (!redisHost) throw new Error("❌ AZURE_MANAGED_REDIS_HOST_NAME is not defined in .env");
if (!redisAccessKey) throw new Error("❌ AZURE_MANAGED_REDIS_ACCESS_KEY is not defined in .env");

// ✅ Build Redis connection URL with TLS (rediss)
const redisUrl = `rediss://${redisHost}:6380`;

// ✅ Create Redis client with TLS and reconnect strategy
const redisClient = createClient({
  url: redisUrl,
  password: redisAccessKey,
  socket: {
    reconnectStrategy: (retries) => {
      console.warn(`🔁 Redis reconnect attempt #${retries}`);
      return Math.min(retries * 1000, 5000); // Exponential backoff up to 5s
    },
    keepAlive: 5000, // TCP keep-alive in ms
  },
});

// ✅ Track connection state
let isClientReady = false;

// ✅ Redis client event listeners
redisClient.on('connect', () => {
  console.log('🔌 Connecting to Azure Redis...');
});

redisClient.on('ready', () => {
  isClientReady = true;
  console.log('✅ Redis connection is ready.');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('end', () => {
  console.warn('🚫 Redis connection closed.');
  isClientReady = false;
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client attempting to reconnect...');
});

// ✅ Initial connect and ping
redisClient.connect()
  .then(() => redisClient.ping())
  .then((res) => {
    console.log('📶 Redis Ping:', res); // Should print 'PONG'
  })
  .catch((err) => {
    console.error('❗ Redis Initial Connection Error:', err);
  });

// ✅ Optional keep-alive ping to prevent idle disconnect
setInterval(() => {
  if (isClientReady) {
    redisClient.ping().catch(err =>
      console.warn('⚠️ Redis keep-alive ping failed:', err.message)
    );
  }
}, 240000); // every 4 minutes

// ✅ Gracefully handle shutdown
process.on('SIGINT', async () => {
  if (isClientReady) {
    try {
      await redisClient.quit();
      console.log('🛑 Redis client closed gracefully.');
    } catch (err) {
      console.error('Error closing Redis:', err);
    }
  } else {
    console.warn('Redis client was not connected or already closed.');
  }
  process.exit();
});

// ✅ Export for use elsewhere
export default redisClient;