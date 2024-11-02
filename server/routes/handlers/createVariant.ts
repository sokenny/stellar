import { Request, Response } from 'express';
import db from '../../models';

async function createVariant(req: Request, res: Response) {
  const experimentId: string = req.params.experimentId;
  const { name } = req.body;
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

    const totalVariants = variants.length + 1;
    const baseTraffic = Math.floor(100 / totalVariants);
    const remainder = 100 % totalVariants;

    for (let i = 0; i < variants.length; i++) {
      let newTraffic = baseTraffic + (i < remainder ? 1 : 0);
      await db.Variant.update(
        { traffic: newTraffic },
        {
          where: {
            id: variants[i].id,
          },
          transaction,
        },
      );
    }

    const variant = await db.Variant.create(
      {
        name,
        traffic: baseTraffic + (variants.length < remainder ? 1 : 0),
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
