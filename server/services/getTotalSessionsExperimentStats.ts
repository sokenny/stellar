import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import db from '../models';
import { Op } from 'sequelize';
import juansIps from '../helpers/juansIps';

const goalFunctionMapper = {
  [GoalTypesEnum.SESSION_TIME]: getTotalSessionsGoalSessionTimeStats,
  [GoalTypesEnum.CLICK]: getTotalSessionsGoalClickAndPageVisitStats,
  [GoalTypesEnum.PAGE_VISIT]: getTotalSessionsGoalClickAndPageVisitStats,
};

async function getTotalSessionsGoalSessionTimeStats(experimentId, variantIds) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: {
        experiment_id: experimentId,
        experiment_mounted: true,
        had_issues: {
          [Op.not]: true,
        },
      },
      attributes: [
        ['variant_id', 'variantId'],
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.col('SessionExperiment.session_id'),
          ),
          'sessions',
        ],
        [
          db.sequelize.fn('AVG', db.sequelize.col('session.length')),
          'averageSessionTime',
        ],
        [
          db.sequelize.fn('SUM', db.sequelize.col('session.length')),
          'totalSessionTime',
        ],
      ],
      include: [
        {
          model: db.Session,
          as: 'session',
          attributes: [],
          // where: {
          //   [Op.and]: juansIps.map((ip) => ({
          //     ip: {
          //       [Op.notLike]: `%${ip}%`,
          //     },
          //   })),
          // },
          required: true,
        },
      ],
      group: ['SessionExperiment.variant_id'],
      raw: true,
    });

    const formattedStats = stats.map((stat) => ({
      variantId: stat.variantId,
      sessions: parseInt(stat.sessions, 10),
      averageSessionTime: parseFloat(stat.averageSessionTime).toFixed(2),
      totalSessionTime: parseFloat(stat.totalSessionTime).toFixed(2), // Adding total session time
    }));

    formattedStats.forEach((variantStat) => {
      const index = variantIds.indexOf(variantStat.variantId);
      if (index > -1) {
        variantIds.splice(index, 1);
      }
    });

    variantIds.forEach((variantId) => {
      formattedStats.push({
        variantId: variantId,
        sessions: 0,
        averageSessionTime: '0.00',
        totalSessionTime: '0.00',
      });
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getTotalSessionsGoalSessionTimeStats:', error);
    throw error;
  }
}

async function getTotalSessionsGoalClickAndPageVisitStats(
  experimentId,
  variantIds,
) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: {
        experiment_id: experimentId,
        had_issues: {
          [Op.not]: true,
        },
      },
      attributes: [
        ['variant_id', 'variantId'],
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.literal(
              'CASE WHEN experiment_mounted = TRUE THEN session_id END',
            ),
          ),
          'sessions',
        ],
        [
          db.sequelize.fn(
            'SUM',
            db.sequelize.cast(db.sequelize.col('converted'), 'integer'),
          ),
          'conversions',
        ],
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.literal(
              'DISTINCT CASE WHEN converted = TRUE THEN session.visitor_id END',
            ),
          ),
          'squashedConversions',
        ],
      ],
      include: [
        {
          model: db.Session,
          as: 'session',
          attributes: [],
          // where: {
          //   [Op.and]: juansIps.map((ip) => ({
          //     ip: {
          //       [Op.notLike]: `%${ip}%`,
          //     },
          //   })),
          // },
          required: true,
        },
      ],
      group: ['variant_id'],
      raw: true,
    });

    const formattedStats = stats.map((stat) => {
      const conversionRate = parseFloat(
        ((stat.conversions / stat.sessions) * 100).toFixed(2),
      );
      const squashedConversionRate = parseFloat(
        ((stat.squashedConversions / stat.sessions) * 100).toFixed(2),
      );
      return {
        variantId: stat.variantId,
        sessions: parseInt(stat.sessions, 10),
        conversions: parseInt(stat.conversions, 10),
        squashedConversions: parseInt(stat.squashedConversions, 10),
        conversionRate: conversionRate,
        squashedConversionRate: squashedConversionRate,
      };
    });

    formattedStats.forEach((variantStat) => {
      const index = variantIds.indexOf(variantStat.variantId);
      if (index > -1) {
        variantIds.splice(index, 1);
      }
    });

    variantIds.forEach((variantId) => {
      formattedStats.push({
        variantId: variantId,
        sessions: 0,
        conversions: 0,
        squashedConversions: 0,
        conversionRate: 0,
        squashedConversionRate: 0,
      });
    });

    return formattedStats;
  } catch (error) {
    console.error(
      'Error in getTotalSessionsGoalClickAndPageVisitStats:',
      error,
    );
    throw error;
  }
}

async function getTotalSessionsExperimentStats(experimentId) {
  try {
    const experiment = await db.Experiment.findOne({
      where: {
        id: experimentId,
      },
      include: [
        {
          model: db.Variant,
          as: 'variants',
          required: true,
          where: {
            deleted_at: null,
          },
        },
        {
          model: db.Goal,
          as: 'goals',
          required: true,
          through: {
            model: db.GoalExperiment,
            where: {
              is_main: true,
              deleted_at: null,
            },
          },
        },
      ],
    });

    if (!experiment || !experiment.goals || experiment.goals.length === 0) {
      throw new Error('Experiment not found');
    }

    const primaryGoal = experiment.goals[0];
    const goalType = primaryGoal.type;
    const variantIds = experiment.variants.map((variant) => variant.id);
    const functionToCall = goalFunctionMapper[goalType];
    const variantStats = await functionToCall(experimentId, variantIds);

    return variantStats;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

export default getTotalSessionsExperimentStats;
