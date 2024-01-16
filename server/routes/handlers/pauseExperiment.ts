import db from '../../models';

async function pauseExperiment(req, res) {
  try {
    const { id } = req.params;

    await db.Experiment.update(
      { paused_at: new Date() },
      { where: { id, deleted_at: null, ended_at: null } },
    );

    res.json({ message: 'Experiment paused successfully' });
  } catch (error) {
    console.error('Error in pauseExperiment:', error);
    res.status(500).json({ message: 'Error pausing experiment', error });
  }
}

export default pauseExperiment;
