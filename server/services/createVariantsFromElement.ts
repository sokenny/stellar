import db from '../models';

async function createVariantsFromElement({ experimentId }) {
  const variants = await db.Variant.bulkCreate([
    {
      experiment_id: experimentId,
      is_control: true,
      traffic: 50,
      name: 'Variant A (Control)',
    },
    {
      experiment_id: experimentId,
      is_control: false,
      traffic: 50,
      name: 'Variant B',
    },
  ]);

  return variants;
}

export default createVariantsFromElement;
