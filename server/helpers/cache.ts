import * as redis from 'redis';

const client = redis.createClient({
  url: process.env.REDIS_URL,
});
client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

// Let's have allowed-origins be invalidated on every server restart
client.del('allowed-origins');

export async function invalidateCache(key) {
  try {
    await client.del(key);
    console.log(`Cache invalidated for key: ${key}`);
  } catch (err) {
    console.log('Failed to invalidate cache:', err);
  }
}

export { client };
