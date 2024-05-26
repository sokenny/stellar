import { Request, Response } from 'express';
import db from '../../models';

async function updateExperimentName(req: Request, res: Response) {
  console.log('Si so so exp');
  const experimentId: string = req.params.id;
  const { name } = req.body;

  console.log('name: ', name);

  const experiment = await db.Experiment.findOne({
    where: { id: experimentId },
  });

  if (!experiment) {
    return res.status(404).send('Experiment not found.');
  }

  const updatedExperiment = await experiment.update({ name });

  res.json(updatedExperiment);
}

export default updateExperimentName;
