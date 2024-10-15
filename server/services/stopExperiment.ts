import { invalidateCache } from '../helpers/cache';
import db from '../models';

async function stopExperiment(experimentId) {
  try {
    await db.Experiment.update(
      { ended_at: new Date() },
      { where: { id: experimentId } },
    );

    const experiment = await db.Experiment.findByPk(experimentId);

    invalidateCache(`experiments:${experiment.project_id}`);

    return experiment;
  } catch (error) {
    console.error('Error in stopExperiment:', error);
    throw new Error('Error stopping experiment');
  }
}

export default stopExperiment;
