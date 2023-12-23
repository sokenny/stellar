import { Op } from 'sequelize';
import db from '../models';

async function setGoal(req, res) {
  const { experiment_id, journey_id, type, selector, page_url } = req.body;

  const experiment = await db.Experiment.findOne({
    where: {
      id: experiment_id,
    },
    include: [
      {
        model: db.Goal,
        as: 'goal',
      },
    ],
  });

  if (!experiment) {
    return res.status(404).json({
      error: 'Experiment not found for id ' + experiment_id,
    });
  }

  if (experiment.goal) {
    const updatedGoal = await experiment.goal.update({
      type,
      selector,
      page_url,
    });

    return res.json(updatedGoal);
  }

  if (experiment.started_at) {
    return res.status(400).json({
      error: 'Cannot add goal to an experiment that has already started',
    });
  }

  const goal = await db.Goal.create({
    experiment_id,
    type,
    selector,
    page_url,
  });

  if (journey_id) {
    const experiments = await db.Experiment.findAll({
      where: {
        journey_id,
        id: {
          [Op.ne]: experiment_id,
        },
      },
    });

    experiments.forEach(async (experiment) => {
      await db.Goal.create({
        experiment_id: experiment.id,
        type,
        selector,
        page_url,
      });
    });
  }

  res.json(goal);
}

export default setGoal;
