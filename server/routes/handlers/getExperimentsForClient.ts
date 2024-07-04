import { Op } from 'sequelize';
import db from '../../models';
import * as redis from 'redis';
import { decryptApiKey } from '../../helpers/crypto';

const client: any = redis.createClient({
  url: 'redis://127.0.0.1:6379',
});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

async function getExperimentsForClientForUser(
  projectId: number,
): Promise<any[]> {
  const start = Date.now();
  const cacheKey = `experiments:${projectId}`;

  const cachedExperiments = await client.get(cacheKey);
  if (cachedExperiments) {
    console.log(`Cache hit for user ${projectId}`);
    const end = Date.now();

    console.log(
      `Retrieved experiments for user ${projectId} in ${end - start}ms`,
    );
    return JSON.parse(cachedExperiments);
  }

  console.log(`Cache miss for user ${projectId}`);

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
            where: { id: projectId },
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
  console.log(
    `Retrieved experiments for project ${projectId} in ${end - start}ms`,
  );

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

// TODO-p1-1: The variant to use should not be cached in redis :p!

async function getExperimentsForClient(req, res) {
  const apiKey = req.header('Authorization').substring(7);

  if (!apiKey) {
    return res.status(401).send('API key is required');
  }

  const keyData: any = decryptApiKey(apiKey);

  if (!keyData) {
    return res.status(401).send('Invalid API key');
  }

  const experiments = await getExperimentsForClientForUser(keyData.projectId);

  res.json(experiments);
}

export default getExperimentsForClient;
