import { Request, Response } from 'express';
import db from '../../models';

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
        where: {
          deleted_at: null,
        },
        include: [
          {
            model: db.Variant,
            as: 'variants',
            attributes: ['id', 'is_control', 'text', 'traffic'],
            where: {
              deleted_at: null,
            },
          },
          {
            model: db.Goal,
            as: 'goal',
          },
          {
            model: db.Element,
            as: 'element',
            required: true,
          },
        ],
      },
    ],
  });

  res.send(journey);
}

export default getJourneyTree;
