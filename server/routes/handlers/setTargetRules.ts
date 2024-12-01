import { Request, Response } from 'express';
import db from '../../models';
import { invalidateCache } from '../../helpers/cache';

async function setTargetRules(req: Request, res: Response) {
  const experimentId = req.params.id;
  const rules = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    // First find the experiment to get project_id
    const experiment = await db.Experiment.findByPk(experimentId, {
      transaction,
    });
    if (!experiment) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Experiment not found' });
    }

    // Find existing target rule for this project and experiment
    let targetRule = await db.TargetRule.findOne({
      where: { project_id: experiment.project_id },
      include: [
        {
          model: db.Experiment,
          as: 'experiments',
          where: { id: experimentId },
          required: true,
        },
      ],
      transaction,
    });

    if (!targetRule) {
      // Create new target rule if none exists
      targetRule = await db.TargetRule.create(
        {
          project_id: experiment.project_id,
          rules: rules,
        },
        { transaction },
      );

      // Create the association
      await db.ExperimentTargetRule.create(
        {
          experiment_id: experimentId,
          target_rule_id: targetRule.id,
        },
        { transaction },
      );
    } else {
      // Update existing target rule
      await targetRule.update({ rules }, { transaction });

      // Ensure the association exists
      await db.ExperimentTargetRule.findOrCreate({
        where: {
          experiment_id: experimentId,
          target_rule_id: targetRule.id,
        },
        transaction,
      });
    }

    await transaction.commit();

    invalidateCache(`experiments:${experiment.project_id}`);

    res.json({ success: true, targetRule });
  } catch (error) {
    await transaction.rollback();
    console.error('Error setting target rules:', error);
    res.status(500).json({ error: 'Failed to set target rules' });
  }
}

export default setTargetRules;
