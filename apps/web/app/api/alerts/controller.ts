import dotenv from 'dotenv';
import { createClient, RedisClientType } from 'redis';

dotenv.config();

export class MyRedisClient {
    private static redisClient: RedisClientType | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Method to initialize the Redis client
    public static async initialize() {
        if (!this.redisClient) {
            this.redisClient = createClient({
                url: process.env.redis_url as string, // Use the correct env variable name
            });

            this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
            await this.redisClient.connect();
        }
    }

    // Static method to add to the queue
    public static async addToQueue(params: string) {
        if (this.redisClient) {
            await this.redisClient.lPush('AlertQueue', params);
        } else {
            console.error('Redis client is not initialized. Call initialize() first.');
        }
    }
}

// Function to initialize Redis
async function redisInitialize() {
    await MyRedisClient.initialize();
}

// Export the promise of initialization
const redisPromise = redisInitialize();

export default redisPromise;
