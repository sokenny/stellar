import db from '../../models';

async function getExperiments(req, res) {
  // const { projectId } = req.query;
  const projectId = 35;
  const experiments = await db.Experiment.findAll({
    where: {
      project_id: projectId,
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
        required: true,
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(experiments);
}

export default getExperiments;
