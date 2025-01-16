import { invalidateCache } from '../../helpers/cache';
import db from '../../models';

async function editExperimentUrlRules(req, res) {
  const experimentId = req.params.id;
  const projectId = req.projectId;
  const { url, advanced_url_rules } = req.body;

  try {
    const experiment = await db.Experiment.update(
      {
        url: advanced_url_rules ? '' : url,
        editor_url: advanced_url_rules ? '' : url,
        advanced_url_rules: advanced_url_rules || null,
      },
      {
        where: { id: experimentId },
        returning: true,
      },
    );

    await invalidateCache(`experiments:${projectId}`);

    res.json(experiment[1][0]);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to update experiment URL rules',
      details: error.message,
    });
  }
}

export default editExperimentUrlRules;
