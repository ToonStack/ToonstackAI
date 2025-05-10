import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create the Redis client with connection details
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1', // Default to localhost if not set
    port: process.env.REDIS_PORT || 6379,       // Default Redis port
    tls: process.env.REDIS_TLS === 'true',      // Use TLS if set in environment
  },
  password: process.env.REDIS_ACCESS_KEY,       // Redis access key (from environment)
});

// Handle errors with Redis client
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Handle the 'close' event (if the connection is lost)
redisClient.on('end', () => {
  console.log('Redis connection lost, attempting to reconnect...');
  setTimeout(() => {
    redisClient.connect().catch(console.error);  // attempt to reconnect
  }, 5000);  // Retry after 5 seconds
});

// Connect to Redis
redisClient.connect().then(() => {
  console.log('Connected to Redis');
  // Test Redis connection
  redisClient.ping().then((pingResponse) => {
    console.log('Redis Ping Response:', pingResponse);  // Should print 'PONG'
  }).catch((err) => {
    console.error('Ping Error:', err);
  });
});

// Gracefully handle process exit
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis connection closed');
  process.exit();  // Exit the process after cleanup
});

// Export the client for use in other modules
export default redisClient;
