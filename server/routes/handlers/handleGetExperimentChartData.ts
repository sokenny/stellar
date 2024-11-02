import getExperimentChartData from '../../services/getExperimentChartData';

async function handleGetExperimentChartData(req, res) {
  const { id } = req.params;

  try {
    const chartData = await getExperimentChartData(id);
    res.json(chartData);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}

export default handleGetExperimentChartData;
