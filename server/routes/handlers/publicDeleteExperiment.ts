import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function publicDeleteExperiment(req, res) {
  const { id } = req.params;

  const experiment = await db.Experiment.findOne({
    where: { id },
    include: [{ model: db.Project, as: 'project' }],
  });

  if (experiment.project.user_id !== null) {
    return res.status(403).json({ error: 'Cannot delete this experiment' });
  }

  await db.Experiment.update({ deleted_at: new Date() }, { where: { id } });

  res.json({ success: true });
}

export default publicDeleteExperiment;
