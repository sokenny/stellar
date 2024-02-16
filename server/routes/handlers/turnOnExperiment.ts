import db from '../../models';

async function turnOnExperiment(req, res) {
  try {
    const { id } = req.params;

    // TODO-p1: Add check to make sure that there is not another experiment running for this same page

    await db.Experiment.update(
      {
        paused_at: null,
        started_at: db.Sequelize.literal(
          'CASE WHEN started_at IS NULL THEN NOW() ELSE started_at END',
        ),
      },
      { where: { id, deleted_at: null, ended_at: null } },
    );

    res.json({ message: 'Experiment resumed successfully' });
  } catch (error) {
    console.error('Error in turnOnExperiment:', error);
    res.status(500).json({ message: 'Error pausing experiment', error });
  }
}

export default turnOnExperiment;
