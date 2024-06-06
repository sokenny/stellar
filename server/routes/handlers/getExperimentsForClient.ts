import { Op } from 'sequelize';
import db from '../../models';

async function getUserByApiKey(apiKey: string) {
  console.log('apiKey: ', apiKey);
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

  console.log('llegamo aca: ', keyWUser.user);

  return keyWUser.user;
}

async function getExperimentsForClientForUser(userId: number) {
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

  const experiments = experimentInstances.map((experiment) => {
    const experimentJson = experiment.toJSON();
    // Implement weighted selection based on traffic percentages
    let selectedVariantId = weightedRandomSelection(experimentJson.variants);
    experimentJson.variant_to_use = selectedVariantId;
    return experimentJson;
  });

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
  return null; // Fallback if something goes wrong
}

async function getExperimentsForClient(req, res) {
  const apiKey = req.header('Authorization').substring(7);

  if (!apiKey) {
    return res.status(401).send('API key is required');
  }

  const user = await getUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).send('Invalid API key');
  }

  const experiments = await getExperimentsForClientForUser(user.id);

  res.json(experiments);
}

export default getExperimentsForClient;
