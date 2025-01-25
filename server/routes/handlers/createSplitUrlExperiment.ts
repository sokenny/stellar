import { invalidateCache } from '../../helpers/cache';
import removeUrlParams from '../../helpers/removeUrlParams';
import db from '../../models';

async function createExperiment(req, res) {
  const { type, baseUrl, variants, projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  if (type === 'SPLIT_URL' && !baseUrl) {
    res.status(400).json({ error: 'Base URL is required for split URL tests' });
    return;
  }

  const sanitizedBaseUrl = removeUrlParams(baseUrl);

  const experiment = await db.Experiment.create({
    project_id: projectId,
    url: sanitizedBaseUrl,
    name: `Split URL Test - ${new Date().toLocaleDateString()}`,
    editor_url: baseUrl || null,
    type: 'SPLIT_URL',
    advanced_url_rules: null,
  });

  console.log('variants length', variants.length);
  console.log('Traffic per each', Math.floor(100 / variants.length));

  const variantsToCreate = [
    // Add base URL as control variant
    {
      experiment_id: experiment.id,
      url: sanitizedBaseUrl,
      preserve_url_params: null,
      is_control: true,
      name: 'Variant A (Control)',
      traffic: Math.floor(100 / (variants.length + 1)), // Account for control variant
    },
    // Add additional variants
    ...variants.map((variant, index) => {
      const variantLetter = String.fromCharCode(66 + index); // Start from 'B' since 'A' is control
      return {
        experiment_id: experiment.id,
        url: variant.url,
        preserve_url_params: variant.preserve_url_params,
        is_control: false,
        name: `Variant ${variantLetter}`,
        traffic: Math.floor(100 / (variants.length + 1)), // Account for control variant
      };
    }),
  ];

  const createdVariants = await Promise.all(
    variantsToCreate.map((variant) => db.Variant.create(variant)),
  );

  await invalidateCache(`experiments:${projectId}`);

  res.json({
    ...experiment.dataValues,
    variants: createdVariants,
  });
}

export default createExperiment;
