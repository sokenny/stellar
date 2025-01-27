import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function createGoal(req, res) {
  const projectId = req.projectId;
  const {
    experimentId,
    type,
    selector,
    url_match_type,
    url_match_value,
    element_url,
    name,
  } = req.body;

  if (experimentId) {
    const experiment = await db.Experiment.findOne({
      where: {
        id: experimentId,
      },
    });

    if (!experiment) {
      return res.status(404).json({
        error: 'Experiment not found for id ' + experimentId,
      });
    }

    if (experiment.started_at) {
      return res.status(400).json({
        error:
          'Cannot add or edit goal of an experiment that has already started',
      });
    }
  }

  const goal = await db.Goal.create({
    type,
    selector,
    url_match_type,
    url_match_value,
    element_url,
    project_id: projectId,
    name,
  });

  if (experimentId) {
    await db.GoalExperiment.update(
      { deleted_at: new Date() },
      {
        where: {
          experiment_id: experimentId,
          is_main: true,
          deleted_at: null,
        },
      },
    );

    await db.GoalExperiment.create({
      experiment_id: experimentId,
      goal_id: goal.id,
      is_main: true,
    });
  }

  await invalidateCache(`experiments:${projectId}`);

  res.json(goal);
}

export default createGoal;
