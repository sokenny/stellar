import { Op } from 'sequelize';
import db from '../../models';
import { decryptApiKey } from '../../helpers/crypto';
import { client as redisClient } from '../../helpers/cache';

async function updateSnippetStatus(projectId: number) {
  const project = await db.Project.findByPk(projectId);

  if (!project) {
    return;
  }
  if (project.snippet_status !== 0) {
    project.snippet_status = 1;
    await project.save();
  }
}

async function getProjectExperiments(projectId: number): Promise<any[]> {
  const cacheKey = `experiments:${projectId}`;

  const cachedExperiments = await redisClient.get(cacheKey);

  // TODO-p1-1: We need to look for a more efficient way to update the snippet status
  updateSnippetStatus(projectId);

  if (cachedExperiments) {
    console.log(`Cache hit for project ${projectId}`);
    const experiments = JSON.parse(cachedExperiments);
    return selectVariantsAtRuntime(experiments);
  }

  console.log(`Cache miss for project ${projectId}`);
  const experiments = await fetchExperiments(projectId);
  redisClient.set(cacheKey, JSON.stringify(experiments));

  return selectVariantsAtRuntime(experiments);
}

async function fetchExperiments(projectId: number) {
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
        model: db.Project,
        as: 'project',
        required: true,
        attributes: ['id'],
        where: { id: projectId },
      },
      {
        model: db.TargetRule,
        as: 'targetRules',
        required: false,
        through: { attributes: [] },
      },
    ],
  });

  const experiments = experimentInstances.map((experiment) =>
    experiment.toJSON(),
  );
  return experiments;
}

function selectVariantsAtRuntime(experiments) {
  return experiments.map((experiment) => {
    const selectedVariantId = weightedRandomSelection(experiment.variants);
    return {
      ...experiment,
      variant_to_use: selectedVariantId,
    };
  });
}

function weightedRandomSelection(variants) {
  const totalWeight = variants.reduce(
    (acc, variant) => acc + variant.traffic,
    0,
  );
  let randomNum = Math.random() * totalWeight;
  for (let variant of variants) {
    randomNum -= variant.traffic;
    if (randomNum <= 0) {
      return variant.id;
    }
  }
  return null;
}

async function getExperimentsForClient(req, res) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send('Authorization header is required');
  }

  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!apiKey) {
    return res.status(401).send('API key is required');
  }

  const keyData: any = decryptApiKey(apiKey);

  if (!keyData) {
    return res.status(401).send('Invalid API key');
  }

  const experiments = await getProjectExperiments(keyData.projectId);

  res.json(experiments);
}

export default getExperimentsForClient;
