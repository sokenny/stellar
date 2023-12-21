import db from '../models';

async function createGoal(req, res) {
  const { experimentId, type, selector, page_url } = req.body;

  const experiment = await db.Experiment.findOne({
    where: {
      id: experimentId,
      // TODO: check that experiment is not running yet - we will need a column like 'started_at'
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

  const goal = await db.Goal.create({
    experiment_id: experimentId,
    type,
    selector,
    page_url,
  });

  res.json(goal);
}

export default createGoal;
