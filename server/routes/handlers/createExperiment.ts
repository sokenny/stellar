import db from '../../models';
import createVariantsFromElement from '../../services/createVariantsFromElement';

async function createExperiment(req, res) {
  const { selector, properties, url, elementType, tempId, projectId } =
    req.body;

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  const element = await db.Element.create({
    selector,
    properties,
    type: elementType,
  });

  const experiment = await db.Experiment.create({
    project_id: projectId,
    element_id: element.id,
    name: elementType + ' Experiment ' + tempId,
    url,
  });

  await createVariantsFromElement({
    experimentId: experiment.id,
    element,
  });

  res.json(experiment);
}

export default createExperiment;
