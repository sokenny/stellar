import getExperimentStats from '../../services/getExperimentStats';

async function getExperimentStatsHandler(req, res) {
  const { id } = req.params;
  try {
    const stats = await getExperimentStats(id);
    res.json(stats);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}

export default getExperimentStatsHandler;
