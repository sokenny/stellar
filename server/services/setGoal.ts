import { Op } from 'sequelize';
import db from '../models';

async function setGoal(req, res) {
  const { experiment_id, type, selector, page_url } = req.body;

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

  const journeyId = experiment.journey_id;

  if (!experiment) {
    return res.status(404).json({
      error: 'Experiment not found for id ' + experiment_id,
    });
  }

  if (experiment.started_at) {
    return res.status(400).json({
      error:
        'Cannot add or edit goal of an experiment that has already started',
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

  const goal = await db.Goal.create({
    experiment_id,
    type,
    selector,
    page_url,
  });

  // If this goal's experiment belongs to a journey and other experiments in that journey don't have a goal, we default them to this goal
  if (journeyId) {
    const experiments = await db.Experiment.findAll({
      where: {
        journey_id: journeyId,
        id: {
          [Op.ne]: experiment_id,
        },
      },
      include: [
        {
          model: db.Goal,
          as: 'goal',
        },
      ],
    });

    const journeyExperimentsWithNoGoal = experiments.filter(
      (experiment) => !experiment.goal,
    );

    journeyExperimentsWithNoGoal.forEach(async (experiment) => {
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
