import { Op } from 'sequelize';
import db from '../../models';

async function turnOnExperiment(req, res) {
  try {
    const { id } = req.params;

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

    // Check if there's an active experiment on the same page
    const inPageExperiment = await db.Experiment.findOne({
      where: {
        page_id: experiment.page_id,
        deleted_at: null,
        ended_at: null,
        started_at: { [Op.ne]: null },
        project_id: experiment.project_id, // Just to be extra careful
      },
    });

    console.log('inPageExperiment!', inPageExperiment);

    if (inPageExperiment) {
      return res.status(400).json({
        message:
          'The targeted page has an active experiment. Please finish all experiments on this page before launching a new one.',
      });
    }

    // Fetch all variants for the experiment that are not marked as deleted
    const variants = await db.Variant.findAll({
      where: {
        experiment_id: id,
        deleted_at: null,
      },
    });

    // Calculate the sum of traffic percentages
    const totalTraffic = variants.reduce(
      (sum, variant) => sum + variant.traffic,
      0,
    );

    if (totalTraffic !== 100) {
      return res.status(400).json({
        message:
          'The sum of traffic for all active variants must equal 100% before the experiment can start.',
      });
    }

    // Start the experiment if all checks pass
    const updatedExperiment = await db.Experiment.update(
      { started_at: db.Sequelize.literal('NOW()') },
      { where: { id, deleted_at: null } },
    );

    res.json({
      experiment: updatedExperiment,
      message: 'Experiment turned on successfully',
    });
  } catch (error) {
    console.error('Error in turnOnExperiment:', error);
    res.status(500).json({ message: 'Error starting experiment', error });
  }
}

export default turnOnExperiment;
