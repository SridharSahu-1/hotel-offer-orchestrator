import { createClient, RedisClientType } from 'redis';
import { HotelOffer } from './types';
import { normalizeHotelName } from './hotel-logic';

let client: RedisClientType | undefined;

function getRedisClient(): RedisClientType {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
    client.on('error', (error) => console.error('Redis error:', error));
  }
  return client;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedisClient();
  if (!redis.isOpen) await redis.connect();
}

export async function pingRedis(): Promise<boolean> {
  try {
    await connectRedis();
    return (await getRedisClient().ping()) === 'PONG';
  } catch {
    return false;
  }
}

export async function saveOffers(city: string, offers: HotelOffer[]): Promise<void> {
  await connectRedis();
  const redis = getRedisClient();
  const dataKey = `hotels:data:${city.toLowerCase()}`;
  const priceKey = `hotels:prices:${city.toLowerCase()}`;
  const transaction = redis.multi().del([dataKey, priceKey]);

  for (const offer of offers) {
    const nameKey = normalizeHotelName(offer.name);
    transaction.hSet(dataKey, nameKey, JSON.stringify(offer));
    transaction.zAdd(priceKey, { score: offer.price, value: nameKey });
  }

  await transaction.exec();
}

export async function filterOffers(city: string, minPrice?: number, maxPrice?: number): Promise<HotelOffer[]> {
  await connectRedis();
  const redis = getRedisClient();
  const dataKey = `hotels:data:${city.toLowerCase()}`;
  const priceKey = `hotels:prices:${city.toLowerCase()}`;
  const names = await redis.zRangeByScore(priceKey, minPrice ?? '-inf', maxPrice ?? '+inf');
  if (names.length === 0) return [];
  const values = await redis.hmGet(dataKey, names);
  return values.filter((value): value is string => value !== undefined && value !== null).map((value) => JSON.parse(value));
}
