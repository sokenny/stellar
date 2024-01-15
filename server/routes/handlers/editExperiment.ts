import db from '../../models';

async function editExperiment(req, res) {
  const { name, order, experimentId, journeyId } = req.body;

  const experiment = await db.Experiment.update(
    { name: name },
    { where: { id: experimentId } },
  );

  const journey = await db.Journey.findOne({
    where: { id: journeyId },
    include: [{ model: db.Experiment, as: 'experiments' }],
  });

  const experiments_order = journey.experiments_order || [];
  const currentExperiments = journey.experiments || [];

  const experimentToMove = currentExperiments.find(
    (exp) => exp.id === experimentId,
  );
  if (experimentToMove && experimentToMove.started_at !== null) {
    return res
      .status(400)
      .send(
        'Cannot change the order of an experiment that has already started.',
      );
  }

  const index = experiments_order.indexOf(experimentId);
  if (index > -1) {
    experiments_order.splice(index, 1);
  }

  const startedExperiments = currentExperiments
    .filter((exp) => exp.started_at !== null)
    .map((exp) => exp.id);
  const newOrderPosition = order - 1;
  if (
    startedExperiments.some(
      (startedExpId) =>
        experiments_order.indexOf(startedExpId) <= newOrderPosition,
    )
  ) {
    return res
      .status(400)
      .send(
        'Cannot place an experiment ahead of or replace a started experiment.',
      );
  }

  experiments_order.splice(newOrderPosition, 0, experimentId);

  await db.Journey.update(
    { experiments_order: experiments_order },
    { where: { id: journey.id } },
  );

  res.json(experiment);
}

export default editExperiment;
