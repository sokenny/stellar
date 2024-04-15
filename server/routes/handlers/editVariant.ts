import { Request, Response } from 'express';
import validateTraffic from '../../helpers/validateTraffic';
import db from '../../models';

async function editVariant(req: Request, res: Response) {
  const variantId: string = req.params.id;
  const { name } = req.body;

  const trafficObj = validateTraffic(req.body);

  if (trafficObj instanceof Error) {
    return res.status(400).send(trafficObj.message);
  }

  const variant = await db.Variant.findOne({
    where: { id: variantId },
    include: [{ model: db.Experiment, as: 'experiment', required: true }],
  });

  if (!variant) {
    return res.status(404).send('Variant not found.');
  }

  const valuesToSet = {
    traffic: trafficObj[variantId],
  };

  if (variant.experiment.started_at === null) {
    valuesToSet['name'] = name;
  }

  const updatedVariant = await variant.update(valuesToSet);

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
