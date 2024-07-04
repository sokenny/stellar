import db from '../models';
import { client as redisClient } from '../helpers/cache';

const staticAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://gostellar.app',
  'https://www.gostellar.app',
];

async function getAllowedOrigins() {
  const cacheKey = 'allowed-origins';
  let cachedOrigins = await redisClient.get(cacheKey);

  if (cachedOrigins) {
    console.log('---- USING CACHED ORIGINS ----');
    return JSON.parse(cachedOrigins);
  }

  console.log('---- FETCHING ORIGINS FROM DATABASE ----');

  const allowedOriginsQuery = await db.Project.findAll({
    attributes: ['domain'],
    raw: true,
  });

  const allowedOrigins = allowedOriginsQuery.map((item) => item.domain);

  const allowedOriginsWithHttp = allowedOrigins.map(
    (domain) => `http://${domain}`,
  );
  const allowedOriginsWithHttps = allowedOrigins.map(
    (domain) => `https://${domain}`,
  );
  const allAllowedOrigins = [
    ...staticAllowedOrigins,
    ...allowedOriginsWithHttp,
    ...allowedOriginsWithHttps,
  ];

  await redisClient.set(cacheKey, JSON.stringify(allAllowedOrigins), {
    EX: 60 * 60,
  });

  return allAllowedOrigins;
}

export default getAllowedOrigins;
