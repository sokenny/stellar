import removeUrlParams from '../../helpers/removeUrlParams';
import db from '../../models';
import createVariantsFromElement from '../../services/createVariantsFromElement';

async function createExperiment(req, res) {
  const { name, url, projectId } = req.body;

  const sanitizedUrl = removeUrlParams(url);

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  const experiment = await db.Experiment.create({
    project_id: projectId,
    url: sanitizedUrl,
    name,
  });

  const variants = await createVariantsFromElement({
    experimentId: experiment.id,
  });

  res.json({
    ...experiment.dataValues,
    variants,
  });
}

export default createExperiment;
