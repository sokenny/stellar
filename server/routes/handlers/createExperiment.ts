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

  let page = await db.Page.findOne({ where: { url } });

  // if not page, create page
  if (!page) {
    console.log('no hay page!!');
    page = await db.Page.create({
      url,
      name: url,
      project_id: projectId,
    });
  }

  console.log('Page id! ', page.id);

  const experiment = await db.Experiment.create({
    project_id: projectId,
    url: sanitizedUrl,
    name,
    page_id: page.id,
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
