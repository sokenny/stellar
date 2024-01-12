import db from '../../models';

async function stopExperiment(req, res) {
  const { id } = req.params;
  const experiment = await db.Experiment.update(
    { ended_at: new Date() },
    {
      where: {
        id,
      },
    },
  );

  res.json(experiment);
}

export default stopExperiment;
