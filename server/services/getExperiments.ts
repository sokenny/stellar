import { Op } from 'sequelize';
import db from '../models';

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

async function getExperimentsForUser(userId: number) {
  const experimentInstances = await db.Experiment.findAll({
    where: {
      start_date: {
        [Op.lte]: new Date(),
      },
      end_date: {
        [Op.gte]: new Date(),
      },
    },
    include: [
      {
        model: db.Variant,
        as: 'variants',
        required: true,
      },
      {
        model: db.Journey,
        as: 'journey',
        required: true,
        attributes: ['id'],
        include: [
          {
            model: db.Project,
            as: 'project',
            required: true,
            attributes: ['id'],
            where: {
              user_id: userId,
            },
          },
          {
            model: db.Element,
            as: 'elements',
            required: true,
            attributes: ['id', 'type', 'selector'],
          },
        ],
      },
    ],
  });

  const experiments = experimentInstances.map((experiment) => {
    const experimentJson = experiment.toJSON();
    const variantIds = experimentJson.variants.map((variant) => variant.id);
    let selectedVariantId = null;
    if (variantIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * variantIds.length);
      selectedVariantId = variantIds[randomIndex];
    }
    // NOTE: If the client already has a variant in localStorage, it will use that one instead of the one we select here
    experimentJson.variant_to_use = selectedVariantId;
    return experimentJson;
  });

  return experiments;
}

async function getExperiments(req, res) {
  const apiKey = req.header('Authorization').substring(7);

  if (!apiKey) {
    return res.status(401).send('API key is required');
  }

  const user = await getUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).send('Invalid API key');
  }

  const experiments = await getExperimentsForUser(user.id);

  console.log('Experiments: ', experiments);

  res.json(experiments);
}

export default getExperiments;