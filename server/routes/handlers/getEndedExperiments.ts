import db from '../../models';
import { Op } from 'sequelize';
async function getEndedExperiments(req, res) {
  const { projectId } = req;
  console.log('projectId', projectId);

  const experiments = await db.Experiment.findAll({
    where: {
      deleted_at: null,
      ended_at: {
        [Op.not]: null,
      },
      project_id: projectId,
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
    order: [['id', 'DESC']],
  });

  res.json(experiments);
}

export default getEndedExperiments;
