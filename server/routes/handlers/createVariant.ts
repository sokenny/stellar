import { Request, Response } from 'express';
import validateTraffic from '../../helpers/validateTraffic';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const experimentId: string = req.params.experimentId;
  const { name } = req.body;
  console.log('name! ', name);
  // console.log('modifs! ', modifications);
  console.log('experimentId: ', experimentId);
  // const trafficObj = validateTraffic(req.body);

  // if (trafficObj instanceof Error) {
  //   return res.status(400).send(trafficObj.message);
  // }

  const experiment = await db.Experiment.findByPk(experimentId);
  if (!experiment) {
    return res.status(404).send('Experiment not found');
  }

  if (experiment.started_at) {
    return res.status(400).send('Experiment has already started');
  }

  const variant = await db.Variant.create({
    // traffic: trafficObj[variantId],
    name,
    traffic: 50,
    experiment_id: experimentId,
    // modifications,
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
