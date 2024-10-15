import { Op } from 'sequelize';
import db from '../models';
import { invalidateCache } from '../helpers/cache';

async function launchExperiment(experimentId) {
  const experiment = await db.Experiment.findOne({
    where: { id: experimentId, deleted_at: null },
  });

  if (!experiment) {
    throw new Error('Experiment not found');
  }

  if (experiment.started_at) {
    throw new Error('Experiment has already started');
  }

  if (experiment.ended_at) {
    throw new Error('Experiment has already ended');
  }

  const inPageExperiment = await db.Experiment.findOne({
    where: {
      page_id: experiment.page_id,
      deleted_at: null,
      ended_at: null,
      started_at: { [Op.ne]: null },
      project_id: experiment.project_id,
      allow_parallel: { [Op.not]: true },
    },
  });

  if (inPageExperiment) {
    throw new Error(
      'The targeted page has an active experiment. Please finish all experiments on this page before launching a new one. Or enable parallel experiments inside the experiment settings.',
    );
  }

  const variants = await db.Variant.findAll({
    where: {
      experiment_id: experimentId,
      deleted_at: null,
    },
  });

  const totalTraffic = variants.reduce(
    (sum, variant) => sum + variant.traffic,
    0,
  );

  if (totalTraffic !== 100) {
    throw new Error(
      'The sum of traffic for all active variants must equal 100% before the experiment can start.',
    );
  }

  await db.Experiment.update(
    { started_at: db.Sequelize.literal('NOW()') },
    { where: { id: experimentId, deleted_at: null } },
  );

  await invalidateCache(`experiments:${experiment.project_id}`);

  return experiment;
}

export default launchExperiment;
