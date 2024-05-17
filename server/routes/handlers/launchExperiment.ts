import { Op } from 'sequelize';
import db from '../../models';

async function turnOnExperiment(req, res) {
  try {
    const { id } = req.params;

    // TODO-p2: We need to start authenticating the user and checking if the experiment belongs to him.

    const experiment = await db.Experiment.findOne({
      where: { id, deleted_at: null },
    });

    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    if (experiment.started_at) {
      return res
        .status(400)
        .json({ message: 'Experiment has already started' });
    }

    if (experiment.ended_at) {
      return res.status(400).json({ message: 'Experiment has already ended' });
    }

    const inPageExperiment = await db.Experiment.findOne({
      where: {
        page_id: experiment.page_id,
        deleted_at: null,
        ended_at: null,
        started_at: {
          [Op.ne]: null,
        },
      },
    });

    if (inPageExperiment) {
      return res.status(404).json({
        message:
          'The targeted page has an active experiment. Please finish all experiments on this page before launching a new one.',
      });
    }

    const updatedExperiment = await db.Experiment.update(
      {
        started_at: db.Sequelize.literal('NOW()'),
      },
      { where: { id, deleted_at: null } },
    );

    res.json({
      experiment: updatedExperiment,
      message: 'Experiment turned on successfully',
    });
  } catch (error) {
    console.error('Error in turnOnExperiment:', error);
    res.status(500).json({ message: 'Error pausing experiment', error });
  }
}

export default turnOnExperiment;
