import { Request, Response } from 'express';
import db from '../../models';

async function getVariant(req: Request, res: Response) {
  const variantId: string = req.params.id;

  const variant = await db.Variant.findByPk(variantId);

  if (!variant) {
    return res.status(404).send('Variant not found');
  }

  res.json(variant);
}

export default getVariant;
