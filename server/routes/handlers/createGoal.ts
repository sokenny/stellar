import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function createGoal(req, res) {
  const projectId = req.projectId;
  const {
    experiment_id,
    type,
    selector,
    url_match_type,
    url_match_value,
    element_url,
    name,
  } = req.body;

  if (experiment_id) {
    const experiment = await db.Experiment.findOne({
      where: {
        id: experiment_id,
      },
    });

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
  }

  const goal = await db.Goal.create({
    type,
    selector,
    url_match_type,
    url_match_value,
    element_url,
    project_id: projectId,
    name: name || 'Untitled Goal',
  });

  if (experiment_id) {
    await db.GoalExperiment.update(
      { deleted_at: new Date() },
      {
        where: {
          experiment_id: experiment_id,
          is_main: true,
          deleted_at: null,
        },
      },
    );

    await db.GoalExperiment.create({
      experiment_id: experiment_id,
      goal_id: goal.id,
      is_main: true,
    });
  }

  await invalidateCache(`experiments:${projectId}`);

  res.json(goal);
}

export default createGoal;
