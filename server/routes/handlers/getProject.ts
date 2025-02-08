import db from '../../models';

async function getProject(req, res) {
  const { id } = req.params;

  const project = await db.Project.findOne({
    where: {
      id,
    },
    include: [
      {
        model: db.Experiment,
        as: 'experiments',
        where: {
          deleted_at: null,
          ended_at: null,
        },
        required: false,
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
        order: [[db.Experiment, 'id', 'DESC']],
      },
      {
        model: db.Goal,
        as: 'goals',
        required: false,
      },
    ],
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
}

export default getProject;
