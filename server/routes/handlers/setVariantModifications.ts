import { Request, Response } from 'express';
import db from '../../models';

async function setVariantModifications(req: Request, res: Response) {
  const variantId: string = req.params.id;
  const { modifications, globalCss, globalJs } = req.body;

  console.log('modifications', modifications);

  const variant = await db.Variant.findOne({
    where: { id: variantId },
    include: [{ model: db.Experiment, as: 'experiment', required: true }],
  });

  if (!variant) {
    return res.status(404).send('Variant not found.');
  }

  const updatedVariant = await variant.update({
    modifications,
    global_css: globalCss || null,
    global_js: globalJs || null,
  });

  res.json(updatedVariant);
}

export default setVariantModifications;
