import stopExperiment from '../../services/stopExperiment';

async function handleStopExperiment(req, res) {
  try {
    const { id } = req.params;
    const experiment = await stopExperiment(id);
    res.json({ message: 'Experiment stopped successfully', experiment });
  } catch (error) {
    console.error('Error in stopExperiment:', error);
    res.status(500).json({ message: 'Error stopping experiment', error });
  }
}

export default handleStopExperiment;
