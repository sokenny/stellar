import { invalidateCache } from '../../helpers/cache';
import removeUrlParams from '../../helpers/removeUrlParams';
import db from '../../models';
import createVariantsFromElement from '../../services/createVariantsFromElement';

async function createExperiment(req, res) {
  const { name, url, projectId, advanced_url_rules } = req.body;

  const sanitizedUrl = removeUrlParams(url);

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  const experiment = await db.Experiment.create({
    project_id: projectId,
    url: sanitizedUrl,
    name,
    advanced_url_rules,
    editor_url: url || null,
    type: 'AB',
  });

  const variants = await createVariantsFromElement({
    experimentId: experiment.id,
  });

  await invalidateCache(`experiments:${projectId}`);

  res.json({
    ...experiment.dataValues,
    variants,
  });
}

export default createExperiment;
