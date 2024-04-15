import { Request, Response } from 'express';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const experimentId: string = req.params.experimentId;
  const { name } = req.body;

  const experiment = await db.Experiment.findByPk(experimentId);
  if (!experiment) {
    return res.status(404).send('Experiment not found');
  }

  if (experiment.started_at) {
    return res.status(400).send('Experiment has already started');
  }

  const variant = await db.Variant.create({
    name,
    traffic: 1,
    experiment_id: experimentId,
  });

  res.json(variant);
}

export default createVariant;
