import { Request, Response } from 'express';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const experimentId: string = req.params.experimentId;
  const { name } = req.body;
  const newVariantTraffic = 10; // Set the traffic percentage for the new variant

  const experiment = await db.Experiment.findByPk(experimentId);
  if (!experiment) {
    return res.status(404).send('Experiment not found');
  }

  if (experiment.started_at) {
    return res.status(400).send('Experiment has already started');
  }

  // Start transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Fetch all current variants of the experiment
    const variants = await db.Variant.findAll({
      where: {
        experiment_id: experimentId,
      },
      transaction,
    });

    // Calculate new traffic allocations and ensure no variant traffic drops to zero
    const trafficReductionFactor = (100 - newVariantTraffic) / 100;
    let adjustments = [];

    for (const variant of variants) {
      let updatedTraffic = Math.floor(variant.traffic * trafficReductionFactor);
      if (updatedTraffic < 1 && variant.traffic > 0) {
        // Ensure no variant goes to zero if it had traffic
        updatedTraffic = 1;
      }
      adjustments.push({ id: variant.id, updatedTraffic });
    }

    // Correct the total traffic sum to 100%
    const totalNewTraffic = adjustments.reduce(
      (sum, adj) => sum + adj.updatedTraffic,
      newVariantTraffic,
    );
    const trafficDifference = 100 - totalNewTraffic;

    if (trafficDifference !== 0) {
      adjustments[adjustments.length - 1].updatedTraffic += trafficDifference; // Adjust the last variant to balance to 100
    }

    // Update each existing variant with the new traffic allocation
    for (const adj of adjustments) {
      await db.Variant.update(
        { traffic: adj.updatedTraffic },
        {
          where: {
            id: adj.id,
          },
          transaction,
        },
      );
    }

    // Create the new variant with specified initial traffic
    const variant = await db.Variant.create(
      {
        name,
        traffic: newVariantTraffic,
        experiment_id: experimentId,
      },
      { transaction },
    );

    await transaction.commit();
    res.json(variant);
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .send('Failed to create new variant due to an internal error.');
  }
}

export default createVariant;
