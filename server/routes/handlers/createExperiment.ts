import db from '../../models';

async function createExperiment(req, res) {
  const { selector, properties, url, elementType, tempId } = req.body;
  const domain = url.split('/')[2];

  const project = await db.Project.findOne({
    where: {
      domain,
    },
    attributes: ['id'],
  });

  const element = await db.Element.create({
    selector,
    properties,
    type: elementType,
  });

  const experiment = await db.Experiment.create({
    project_id: project.id,
    element_id: element.id,
    name: elementType + ' Experiment ' + tempId,
    url,
  });

  res.json(experiment);
}

export default createExperiment;
