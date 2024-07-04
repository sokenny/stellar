import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function turnOnExperiment(req, res) {
  try {
    const { id } = req.params;

    // TODO-p2: Add check to make sure that there is not another experiment running for this same page

    await db.Experiment.update(
      {
        paused_at: null,
        /**
         * NOTE: We are doing this because this endpoint was used both for launching, and resuming
         * experiments. But we will create a new handler and endpoint specifically for launching.
         */
        started_at: db.Sequelize.literal(
          'CASE WHEN started_at IS NULL THEN NOW() ELSE started_at END',
        ),
      },
      { where: { id, deleted_at: null, ended_at: null } },
    );

    invalidateCache(`experiments:${req.projectId}`);

    res.json({ message: 'Experiment turned on successfully' });
  } catch (error) {
    console.error('Error in turnOnExperiment:', error);
    res.status(500).json({ message: 'Error pausing experiment', error });
  }
}

export default turnOnExperiment;
