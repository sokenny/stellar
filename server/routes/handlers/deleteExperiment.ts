import db from '../../models';

async function deleteExperiment(req, res) {
  const { id } = req.params;

  await db.Experiment.update({ deleted_at: new Date() }, { where: { id } });

  res.json({ success: true });
}

export default deleteExperiment;
