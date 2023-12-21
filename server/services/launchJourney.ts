import db from '../models';

async function launchJourney(req, res) {
  const { id } = req.params;

  const experiments = await db.Experiment.findAll({
    where: {
      journey_id: id,
    },
  });

  const hasExperimentStarted = experiments.some(
    (experiment) => experiment.started_at !== null,
  );

  if (hasExperimentStarted) {
    return res.status(400).send({
      message: 'This journey has already been launched',
    });
  }

  const experiment = experiments.reduce((prev, current) =>
    prev.start_date < current.start_date ? prev : current,
  );

  await experiment.update({
    started_at: new Date(),
  });

  return res.status(200).send({
    message: 'Journey launched successfully',
  });
}

export default launchJourney;
