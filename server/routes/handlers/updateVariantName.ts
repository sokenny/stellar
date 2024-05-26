import { Request, Response } from 'express';
import db from '../../models';

async function updateVariantName(req: Request, res: Response) {
  console.log('Si so so');
  const variantId: string = req.params.id;
  const { name } = req.body;

  console.log('name: ', name);

  const variant = await db.Variant.findOne({
    where: { id: variantId },
    include: [{ model: db.Experiment, as: 'experiment', required: true }],
  });

  if (!variant) {
    return res.status(404).send('Variant not found.');
  }

  const updatedVariant = await variant.update({ name });

  res.json(updatedVariant);
}

export default updateVariantName;
