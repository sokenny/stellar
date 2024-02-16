import { Request, Response } from 'express';
import validateTraffic from '../../helpers/validateTraffic';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const variantId: string = req.params.id;
  const {
    // text should soon be removed since it will come inside modifications
    text,
    experimentId,
    modifications,
  } = req.body;
  console.log('modifs! ', modifications);
  console.log('experimentId: ', experimentId);
  // const trafficObj = validateTraffic(req.body);

  // if (trafficObj instanceof Error) {
  //   return res.status(400).send(trafficObj.message);
  // }

  // TODO-p1: Add check to make sure that the associated experiment has not started yet

  const variant = await db.Variant.create({
    text,
    // traffic: trafficObj[variantId],
    traffic: 1,
    experiment_id: experimentId,
    modifications,
  });

  // const variantIdsToUpdate = Object.keys(trafficObj).filter(
  //   (id) => id !== variant.id.toString() && id !== 'undefined',
  // );

  // await Promise.all(
  //   variantIdsToUpdate.map((id) =>
  //     db.Variant.update(
  //       { traffic: trafficObj[id] },
  //       { where: { id }, returning: true },
  //     ),
  //   ),
  // );

  res.json(variant);
}

export default createVariant;
