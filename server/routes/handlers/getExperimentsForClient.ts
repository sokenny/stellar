import { Op } from 'sequelize';
import db from '../../models';
import * as redis from 'redis';
import { decryptApiKey } from '../../helpers/crypto';

const client: any = redis.createClient({
  url: 'redis://127.0.0.1:6379',
});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

async function getUserByApiKey(apiKey: string) {
  // lookup ApiKey and include user required true
  const keyWUser = await db.ApiKey.findOne({
    where: { key: apiKey },
    attributes: ['id'],
    include: [
      {
        model: db.User,
        required: true,
        as: 'user',
      },
    ],
  });

  if (!keyWUser) {
    return null;
  }

  return keyWUser.user;
}

async function getExperimentsForClientForUser(userId: number): Promise<any[]> {
  const start = Date.now();

  // TODO-p1: We should have projectId here

  const cacheKey = `experiments:${userId}`;

  const cachedExperiments = await client.get(cacheKey);
  if (cachedExperiments) {
    console.log(`Cache hit for user ${userId}`);
    const end = Date.now();

    console.log(`Retrieved experiments for user ${userId} in ${end - start}ms`);
    return JSON.parse(cachedExperiments);
  }

  console.log(`Cache miss for user ${userId}`);

  const experimentInstances = await db.Experiment.findAll({
    where: {
      [Op.and]: [
        { started_at: { [Op.ne]: null } },
        { ended_at: { [Op.eq]: null } },
        { deleted_at: { [Op.eq]: null } },
        { paused_at: { [Op.eq]: null } },
      ],
    },
    include: [
      {
        model: db.Variant,
        as: 'variants',
        required: true,
        where: { deleted_at: null },
      },
      {
        model: db.Goal,
        as: 'goal',
        required: true,
      },
      {
        model: db.Page,
        as: 'page',
        required: true,
        attributes: ['id'],
        include: [
          {
            model: db.Project,
            as: 'project',
            required: true,
            attributes: ['id'],
            where: { user_id: userId },
          },
        ],
      },
    ],
  });

  const experiments = experimentInstances.map((experiment: any) => {
    const experimentJson = experiment.toJSON();
    let selectedVariantId = weightedRandomSelection(experimentJson.variants);
    experimentJson.variant_to_use = selectedVariantId;
    return experimentJson;
  });

  client.set(cacheKey, JSON.stringify(experiments));
  const end = Date.now();
  console.log(`Retrieved experiments for user ${userId} in ${end - start}ms`);

  return experiments;
}

function weightedRandomSelection(variants) {
  const totalWeight = variants.reduce(
    (acc, variant) => acc + variant.traffic,
    0,
  );
  let randomNum = Math.random() * totalWeight;
  for (let i = 0; i < variants.length; i++) {
    randomNum -= variants[i].traffic;
    if (randomNum <= 0) {
      return variants[i].id;
    }
  }
  return null;
}

async function getExperimentsForClient(req, res) {
  const apiKey = req.header('Authorization').substring(7);

  if (!apiKey) {
    return res.status(401).send('API key is required');
  }

  const keyData = decryptApiKey(apiKey);

  if (!keyData) {
    return res.status(401).send('Invalid API key');
  }

  console.log('decryptedKey: ', keyData);

  // TODO-p1: In reality, we should have one apikey per user project, so here we should be fetching the project
  const user = await getUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).send('Invalid API key');
  }

  console.log('wait starts');
  const experiments = await getExperimentsForClientForUser(user.id);
  console.log('wait ends');

  res.json(experiments);
}

export default getExperimentsForClient;
