import * as redis from 'redis';

const client = redis.createClient({
  url: 'redis://127.0.0.1:6379',
});
client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

export async function invalidateCache(key) {
  try {
    await client.del(key);
    console.log(`Cache invalidated for key: ${key}`);
  } catch (err) {
    console.log('Failed to invalidate cache:', err);
  }
}

export { client };
