import launchExperiment from '../../services/launchExperiment';

async function handleLaunchExperiment(req, res) {
  try {
    const { id } = req.params;

    const experiment = await launchExperiment(id);

    res.json({
      experiment,
      message: 'Experiment turned on successfully',
    });
  } catch (error) {
    console.error('Error in turnOnExperiment:', error);
    if (error.message === 'Experiment not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
}

export default handleLaunchExperiment;
