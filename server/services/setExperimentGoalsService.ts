import db from '../models';
import { Op } from 'sequelize';

interface GoalPayload {
  id: number;
  isMain: boolean;
}

export async function setExperimentGoalsService(
  experimentId: number,
  goals: GoalPayload[],
) {
  const transaction = await db.sequelize.transaction();

  try {
    const experiment = await db.Experiment.findByPk(experimentId);
    if (!experiment) {
      throw new Error('Experiment not found');
    }

    // Validate all goals exist
    const goalIds = goals.map((g) => g.id);
    const existingGoals = await db.Goal.findAll({
      where: { id: { [Op.in]: goalIds } },
    });

    if (existingGoals.length !== goalIds.length) {
      throw new Error('One or more goals not found');
    }

    const existingGoalExperiments = await db.GoalExperiment.findAll({
      where: {
        experiment_id: experimentId,
        deleted_at: null,
      },
    });

    for (const goal of goals) {
      await db.GoalExperiment.findOrCreate({
        where: {
          experiment_id: experimentId,
          goal_id: goal.id,
          deleted_at: null,
        },
        defaults: {
          is_main: goal.isMain,
        },
        transaction,
      });

      await db.GoalExperiment.update(
        { is_main: goal.isMain },
        {
          where: {
            experiment_id: experimentId,
            goal_id: goal.id,
            deleted_at: null,
          },
          transaction,
        },
      );
    }

    const goalIdsToKeep = new Set(goalIds);
    const goalExperimentsToDelete = existingGoalExperiments.filter(
      (ge) => !goalIdsToKeep.has(ge.goal_id),
    );

    for (const ge of goalExperimentsToDelete) {
      await db.GoalExperiment.update(
        { deleted_at: new Date() },
        {
          where: {
            id: ge.id,
          },
          transaction,
        },
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
