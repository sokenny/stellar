import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function updateGoal(req, res) {
  const projectId = req.projectId;
  const goalId = req.params.id;
  const { type, selector, url_match_type, url_match_value, element_url, name } =
    req.body;

  const goal = await db.Goal.findOne({
    where: {
      id: goalId,
      project_id: projectId,
    },
  });

  if (!goal) {
    return res.status(404).json({
      error: 'Goal not found',
    });
  }

  await goal.update({
    type,
    selector,
    url_match_type,
    url_match_value,
    element_url,
    name,
  });

  await invalidateCache(`experiments:${projectId}`);

  res.json(goal);
}

export default updateGoal;
