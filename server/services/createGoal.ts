import db from '../models';

async function createGoal(req, res) {
  const { experimentId, type, selector, page_url } = req.body;

  const experiment = await db.Experiment.findOne({
    where: {
      id: experimentId,
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
      error: 'Experiment not found for id ' + experimentId,
    });
  }

  if (experiment.goal) {
    return res.status(400).json({
      error: 'Experiment already has a goal',
    });
  }

  if (experiment.started_at) {
    return res.status(400).json({
      error: 'Cannot add goal to an experiment that has already started',
    });
  }

  const goal = await db.Goal.create({
    experiment_id: experimentId,
    type,
    selector,
    page_url,
  });

  res.json(goal);
}

export default createGoal;
