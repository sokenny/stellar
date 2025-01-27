import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function deleteGoal(req, res) {
  const { id } = req.params;
  const projectId = req.projectId;

  try {
    const goal = await db.Goal.findOne({
      where: { id },
      include: [
        {
          model: db.Experiment,
          as: 'experiments',
          through: {
            model: db.GoalExperiment,
            where: { deleted_at: null },
          },
        },
      ],
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal is associated with any active experiments
    if (goal.experiments?.some((exp) => exp.started_at && !exp.ended_at)) {
      return res.status(400).json({
        error:
          'Cannot delete a goal that is being used in an active experiment',
      });
    }

    await db.GoalExperiment.update(
      { deleted_at: new Date() },
      { where: { goal_id: id } },
    );

    await goal.update({ deleted_at: new Date() });

    await invalidateCache(`experiments:${projectId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}

export default deleteGoal;
