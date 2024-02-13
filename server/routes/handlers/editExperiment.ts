import db from '../../models';

async function editExperiment(req, res) {
  const { name, experimentId } = req.body;

  const experiment = await db.Experiment.update(
    { name: name },
    { where: { id: experimentId } },
  );

  res.json(experiment);
}

export default editExperiment;
