import db from '../../models';

async function getExperiment(req, res) {
  const { id } = req.params;

  const experiment = await db.Experiment.findOne({
    where: {
      id,
      deleted_at: null,
    },
    include: [
      {
        model: db.Variant,
        as: 'variants',
        required: false,
        where: {
          deleted_at: null,
        },
      },
      {
        model: db.Goal,
        as: 'primaryGoal',
        required: false,
      },
      {
        model: db.Goal,
        as: 'goals',
        required: false,
        through: {
          attributes: ['is_main'],
        },
      },
      {
        model: db.TargetRule,
        as: 'targetRules',
        required: false,
        through: { attributes: [] },
      },
    ],
  });

  if (!experiment) {
    return res.status(404).json({ error: 'Experiment not found' });
  }

  res.json(experiment);
}

export default getExperiment;
