import { Request, Response } from 'express';
import db from '../models';

async function editVariant(req: Request, res: Response) {
  const variantId: string = req.params.id;
  const { text } = req.body;

  interface TrafficObject {
    [key: string]: number;
  }

  const trafficObj: TrafficObject = Object.keys(req.body)
    .filter((key) => key.startsWith('traffic_'))
    .reduce((acc: TrafficObject, key: string) => {
      const id: string = key.split('_')[1];
      acc[id] = parseInt(req.body[key], 10);
      return acc;
    }, {});

  const totalTraffic: number = Object.values(trafficObj).reduce(
    (sum, traffic) => sum + traffic,
    0,
  );

  if (totalTraffic !== 100) {
    return res
      .status(400)
      .send('The sum of all traffic values must equal 100.');
  }

  const variant = await db.Variant.findOne({
    where: { id: variantId },
    include: [{ model: db.Experiment, as: 'experiment', required: true }],
  });

  if (!variant) {
    return res.status(404).send('Variant not found.');
  }

  if (variant.experiment.started_at !== null) {
    return res
      .status(400)
      .send(
        'Cannot change the text of a variant that is part of a started experiment.',
      );
  }

  const updatedVariant = await variant.update({
    text,
    traffic: trafficObj[variantId],
  });

  const variantIdsToUpdate = Object.keys(trafficObj).filter(
    (id) => id !== variant.id.toString(),
  );

  await Promise.all(
    variantIdsToUpdate.map((id) =>
      db.Variant.update(
        { traffic: trafficObj[id] },
        { where: { id }, returning: true },
      ),
    ),
  );

  res.json(updatedVariant);
}

export default editVariant;
