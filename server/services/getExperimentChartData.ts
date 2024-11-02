import { Op } from 'sequelize';
import db from '../models';

async function getExperimentChartData(experimentId) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: {
        experiment_id: experimentId,
        had_issues: {
          [Op.not]: true,
        },
      },
      attributes: [
        [
          db.sequelize.fn(
            'DATE',
            db.sequelize.col('SessionExperiment.created_at'),
          ),
          'date',
        ],
        'variant_id',
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.fn('DISTINCT', db.sequelize.col('session.visitor_id')),
          ),
          'unique_visitors',
        ],
        [db.sequelize.fn('COUNT', db.sequelize.col('session_id')), 'visitors'],
        [
          db.sequelize.fn(
            'SUM',
            db.sequelize.cast(db.sequelize.col('converted'), 'integer'),
          ),
          'conversions',
        ],
      ],
      include: [
        {
          model: db.Session,
          as: 'session',
          attributes: [],
        },
      ],
      group: [
        db.sequelize.fn(
          'DATE',
          db.sequelize.col('SessionExperiment.created_at'),
        ),
        'variant_id',
      ],
      raw: true,
    });

    const cumulativeData = {};

    const formattedStats = stats.map((stat) => {
      const uniqueVisitors = parseInt(stat.unique_visitors, 10);
      const visitors = parseInt(stat.visitors, 10);
      const conversions = parseInt(stat.conversions, 10);

      if (!cumulativeData[stat.variant_id]) {
        cumulativeData[stat.variant_id] = {
          uniqueVisitors: 0,
          visitors: 0,
          conversions: 0,
        };
      }

      cumulativeData[stat.variant_id].uniqueVisitors += uniqueVisitors;
      cumulativeData[stat.variant_id].visitors += visitors;
      cumulativeData[stat.variant_id].conversions += conversions;

      return {
        date: stat.date,
        variant_id: stat.variant_id,
        unique_visitors: uniqueVisitors,
        visitors: visitors,
        conversions: conversions,
        cumulative_unique_visitors:
          cumulativeData[stat.variant_id].uniqueVisitors,
        cumulative_visitors: cumulativeData[stat.variant_id].visitors,
        cumulative_conversions: cumulativeData[stat.variant_id].conversions,
      };
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getChartData:', error);
    throw error;
  }
}

export default getExperimentChartData;
