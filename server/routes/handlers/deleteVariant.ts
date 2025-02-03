import db from '../../models';

async function deleteVariant(req, res) {
  const { id } = req.params;

  const variant = await db.Variant.findOne({
    where: { id },
    include: [
      {
        model: db.Experiment,
        as: 'experiment',
      },
    ],
  });

  if (variant.experiment.ended_at) {
    return res.status(400).json({
      success: false,
      error:
        'Cannot delete a variant that is part of an experiment that has ended',
    });
  }

  await db.Variant.update({ deleted_at: new Date() }, { where: { id } });

  res.json({ success: true });
}

export default deleteVariant;
