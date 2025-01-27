import { Op } from 'sequelize';
import db from '../../models';
import { decryptApiKey } from '../../helpers/crypto';
import { client as redisClient } from '../../helpers/cache';

async function updateSnippetStatus(projectId: number) {
  console.log('WE IN HERE! updateSnippetStatus', projectId);
  const statusCacheKey = `snippet_status:${projectId}`;

  const cachedStatus = await redisClient.get(statusCacheKey);
  console.log('cachedStatus', cachedStatus);

  if (cachedStatus) {
    console.log(`Cache hit for snippet status of project: ${projectId}`);
    return; // Status already tracked, no need to check DB
  }

  // If not in cache, check DB and update if needed
  const project = await db.Project.findByPk(projectId);
  if (!project) {
    return;
  }

  console.log('project found', project);

  if (project.snippet_status !== 1) {
    project.snippet_status = 1;
    await project.save();
  }

  // Cache the status for 1 hour
  await redisClient.set(statusCacheKey, '1', { EX: 3600 });
}

async function getProjectExperiments(projectId: number): Promise<any[]> {
  const cacheKey = `experiments:${projectId}`;

  const cachedExperiments = await redisClient.get(cacheKey);

  updateSnippetStatus(projectId);

  if (cachedExperiments) {
    console.log(`Cache hit for project ${projectId}`);
    const experiments = JSON.parse(cachedExperiments);
    return selectVariantsAtRuntime(experiments);
  }

  console.log(`Cache miss for project ${projectId}`);
  const experiments = await fetchExperiments(projectId);
  redisClient.set(cacheKey, JSON.stringify(experiments), { EX: 3600 });

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
        as: 'goals',
        required: true,
        through: {
          model: db.GoalExperiment,
          where: {
            deleted_at: null,
          },
          attributes: ['is_main'],
        },
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

  const experiments = experimentInstances.map((experiment) => {
    const expJson = experiment.toJSON();
    // Find the main goal and set it as the 'goal' property
    const mainGoal = expJson.goals.find((g) => g.GoalExperiment.is_main);
    return {
      ...expJson,
      goal: mainGoal, // Add the main goal as 'goal'
      goals: expJson.goals, // Keep all goals in 'goals'
    };
  });

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
