import db from '../../models';

async function deleteVariant(req, res) {
  const { id } = req.params;

  // get variant and include experiment
  const variant = await db.Variant.findOne({
    where: { id },
    include: [
      {
        model: db.Experiment,
        as: 'experiment',
      },
    ],
  });

  if (variant.experiment.started_at) {
    throw new Error(
      'Cannot delete a variant that is part of an experiment that has already started',
    );
  }

  await db.Variant.update({ deleted_at: new Date() }, { where: { id } });

  res.json({ success: true });
}

export default deleteVariant;
