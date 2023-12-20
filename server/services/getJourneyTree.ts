import { Request, Response } from 'express';
import db from '../models';

async function getJourneyTree(req: Request, res: Response): Promise<void> {
  const { journeyId } = req.body;

  const journey = await db.Journey.findOne({
    where: {
      id: journeyId,
    },
    attributes: ['id', 'page'],
    include: [
      {
        model: db.Experiment,
        as: 'experiments',
        attributes: ['id', 'name', 'start_date', 'end_date', 'element_id'],
        include: [
          {
            model: db.Variant,
            as: 'variants',
            attributes: ['id', 'is_control', 'text'],
          },
        ],
      },
    ],
  });

  console.log('journey! ', journey);
  res.send(journey);
}

export default getJourneyTree;
