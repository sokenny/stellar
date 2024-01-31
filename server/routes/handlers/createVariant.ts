import { Request, Response } from 'express';
import validateTraffic from '../../helpers/validateTraffic';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const variantId: string = req.params.id;
  const { text, experimentId } = req.body;
  const trafficObj = validateTraffic(req.body);

  if (trafficObj instanceof Error) {
    return res.status(400).send(trafficObj.message);
  }

  const variant = await db.Variant.create({
    text,
    // TODO: later on we will have to set default fontSize, color, etc here
    traffic: trafficObj[variantId],
    experiment_id: experimentId,
  });

  const variantIdsToUpdate = Object.keys(trafficObj).filter(
    (id) => id !== variant.id.toString() && id !== 'undefined',
  );

  await Promise.all(
    variantIdsToUpdate.map((id) =>
      db.Variant.update(
        { traffic: trafficObj[id] },
        { where: { id }, returning: true },
      ),
    ),
  );

  res.json(variant);
}

export default createVariant;
