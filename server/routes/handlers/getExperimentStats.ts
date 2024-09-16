import getTotalSessionsExperimentStats from '../../services/getTotalSessionsExperimentStats';
import getUniqueUserExperimentStats from '../../services/getUniqueUserExperimentStats';

async function getExperimentStatsHandler(req, res) {
  const { id, type } = req.params;

  try {
    const handler =
      type === 'total-sessions'
        ? getTotalSessionsExperimentStats
        : getUniqueUserExperimentStats;
    const stats = await handler(id);
    res.json(stats);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}

export default getExperimentStatsHandler;
