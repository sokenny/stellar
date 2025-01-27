import { Request, Response } from 'express';
import validateTraffic from '../../helpers/validateTraffic';
import db from '../../models';
import { invalidateCache } from '../../helpers/cache';

async function editVariant(req, res) {
  const projectId: string = req.projectId;
  const variantId: string = req.params.id;
  const { name, url } = req.body;

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

  if (variant.experiment.type === 'SPLIT_URL') {
    valuesToSet['url'] = url;
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

  await invalidateCache(`experiments:${projectId}`);

  res.json(updatedVariant);
}

export default editVariant;
