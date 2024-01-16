import db from '../../models';

async function resumeExperiment(req, res) {
  try {
    const { id } = req.params;

    await db.Experiment.update(
      { paused_at: null },
      { where: { id, deleted_at: null, ended_at: null } },
    );

    res.json({ message: 'Experiment resumed successfully' });
  } catch (error) {
    console.error('Error in resumeExperiment:', error);
    res.status(500).json({ message: 'Error pausing experiment', error });
  }
}

export default resumeExperiment;
