import db from '../models';
import { client as redisClient } from '../helpers/cache';
import normalizeUrl from '../helpers/normalizeUrl';

const staticAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://gostellar.app',
  'https://www.gostellar.app',
  'http://staging.gostellar.app',
  'https://staging.gostellar.app',
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

  const allowedOriginsWithHttp = allowedOrigins.map((domain) =>
    normalizeUrl(`http://${domain}`),
  );
  const allowedOriginsWithHttps = allowedOrigins.map((domain) =>
    normalizeUrl(`https://${domain}`),
  );
  const allowedOriginsWithWww = allowedOrigins.map((domain) =>
    normalizeUrl(`https://www.${domain}`),
  );

  const allAllowedOrigins = [
    ...staticAllowedOrigins,
    ...allowedOriginsWithHttp,
    ...allowedOriginsWithHttps,
    ...allowedOriginsWithWww,
  ];

  await redisClient.set(cacheKey, JSON.stringify(allAllowedOrigins), {
    EX: 60 * 60,
  });

  return allAllowedOrigins;
}

export default getAllowedOrigins;
