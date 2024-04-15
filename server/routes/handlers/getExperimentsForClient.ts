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
        {
          started_at: {
            [Op.ne]: null,
          },
          ended_at: {
            [Op.eq]: null,
          },
          deleted_at: {
            [Op.eq]: null,
          },
          paused_at: {
            [Op.eq]: null,
          },
        },
      ],
    },
    include: [
      {
        model: db.Variant,
        as: 'variants',
        required: true,
        where: {
          deleted_at: null,
        },
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
            where: {
              user_id: userId,
            },
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

  console.log('experimentInstances: ', experimentInstances);

  return experiments;
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

  console.log('user!: ', user);

  const experiments = await getExperimentsForClientForUser(user.id);

  console.log('exps que vamos a mandar: ', experiments);

  res.json(experiments);
}

export default getExperimentsForClient;
