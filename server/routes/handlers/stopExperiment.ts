import db from '../../models';

async function stopExperiment(req, res) {
  try {
    const { id } = req.params;

    await db.Experiment.update({ ended_at: new Date() }, { where: { id } });

    const experiment = await db.Experiment.findByPk(id);

    // TODO:p1-2: start next experiment available under this page

    res.json({ message: 'Experiment stopped successfully', experiment });
  } catch (error) {
    console.error('Error in stopExperiment:', error);
    res.status(500).json({ message: 'Error stopping experiment', error });
  }
}

export default stopExperiment;
