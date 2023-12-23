import { Request, Response } from 'express';
import db from '../models';

async function getJourneyTree(req: Request, res: Response): Promise<void> {
  const journeyId = req.params.id;

  const journey = await db.Journey.findOne({
    where: {
      id: journeyId,
    },
    attributes: ['id', 'page', 'experiments_order'],
    include: [
      {
        model: db.Experiment,
        as: 'experiments',
        attributes: ['id', 'name', 'element_id', 'url'],
        include: [
          {
            model: db.Variant,
            as: 'variants',
            attributes: ['id', 'is_control', 'text'],
          },
          {
            model: db.Goal,
            as: 'goal',
          },
        ],
      },
    ],
  });

  res.send(journey);
}

export default getJourneyTree;
