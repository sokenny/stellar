import db from '../../models';

async function stopExperiment(req, res) {
  try {
    const { id } = req.params;

    await db.Experiment.update({ ended_at: new Date() }, { where: { id } });

    const experiment = await db.Experiment.findByPk(id, {
      include: [{ model: db.Journey, as: 'journey' }],
    });

    if (experiment.journey) {
      const experimentsOrder = experiment.journey.experiments_order;
      const currentExperimentIndex = experimentsOrder.indexOf(experiment.id);

      if (
        currentExperimentIndex >= 0 &&
        currentExperimentIndex < experimentsOrder.length - 1
      ) {
        const nextExperimentId = experimentsOrder[currentExperimentIndex + 1];

        await db.Experiment.update(
          { started_at: new Date() },
          { where: { id: nextExperimentId } },
        );
      }
    }

    res.json({ message: 'Experiment stopped successfully', experiment });
  } catch (error) {
    console.error('Error in stopExperiment:', error);
    res.status(500).json({ message: 'Error stopping experiment', error });
  }
}

export default stopExperiment;
