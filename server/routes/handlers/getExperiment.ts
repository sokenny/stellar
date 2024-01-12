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
      },
      {
        model: db.Goal,
        as: 'goal',
      },
      {
        model: db.Element,
        as: 'element',
      },
    ],
  });

  res.json(experiment);
}

export default getExperiment;
