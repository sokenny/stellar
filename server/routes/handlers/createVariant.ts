import { Request, Response } from 'express';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const experimentId: string = req.params.experimentId;
  const { name } = req.body;
  const newVariantTraffic = 10;
  const experiment = await db.Experiment.findByPk(experimentId);
  if (!experiment) {
    return res.status(404).send('Experiment not found');
  }

  if (experiment.started_at) {
    return res.status(400).send('Experiment has already started');
  }

  const transaction = await db.sequelize.transaction();

  try {
    const variants = await db.Variant.findAll({
      where: {
        experiment_id: experimentId,
        deleted_at: null,
      },
      transaction,
    });

    let currentTotalTraffic = variants.reduce(
      (sum, variant) => sum + variant.traffic,
      0,
    );
    let trafficDeficit = 100 - currentTotalTraffic;

    if (trafficDeficit !== 0 && trafficDeficit > newVariantTraffic) {
      const increasePerVariant = Math.floor(trafficDeficit / variants.length);
      for (let variant of variants) {
        let newTraffic = variant.traffic + increasePerVariant;
        await db.Variant.update(
          { traffic: newTraffic },
          {
            where: {
              id: variant.id,
            },
            transaction,
          },
        );
      }
      trafficDeficit -= increasePerVariant * variants.length;
    }

    const trafficReductionFactor =
      (100 - newVariantTraffic - trafficDeficit) / 100;
    let adjustments = variants.map((variant) => ({
      id: variant.id,
      updatedTraffic: Math.floor(variant.traffic * trafficReductionFactor),
    }));

    const totalNewTraffic =
      adjustments.reduce((sum, adj) => sum + adj.updatedTraffic, 0) +
      newVariantTraffic +
      trafficDeficit;
    if (totalNewTraffic !== 100) {
      const lastAdjustment = adjustments[adjustments.length - 1];
      lastAdjustment.updatedTraffic += 100 - totalNewTraffic;
    }

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

    const variant = await db.Variant.create(
      {
        name,
        traffic: newVariantTraffic + trafficDeficit,
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
      .send(
        'Failed to create new variant due to an internal error: ' +
          error.message,
      );
  }
}

export default createVariant;
