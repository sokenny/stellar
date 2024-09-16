import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import db from '../models';

const goalFunctionMapper = {
  [GoalTypesEnum.SESSION_TIME]: getUniqueUserGoalSessionTimeStats,
  [GoalTypesEnum.CLICK]: getUniqueUserGoalClickAndPageVisitStats,
  [GoalTypesEnum.PAGE_VISIT]: getUniqueUserGoalClickAndPageVisitStats,
};

async function getUniqueUserExperimentStats(experimentId) {
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
          as: 'goal',
          required: true,
        },
      ],
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    const goalType = experiment.goal.type;
    const variantIds = experiment.variants.map((variant) => variant.id);
    const functionToCall = goalFunctionMapper[goalType];
    const variantStats = await functionToCall(experimentId, variantIds);

    return variantStats;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
}

async function getUniqueUserGoalSessionTimeStats(experimentId, variantIds) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: { experiment_id: experimentId },
      attributes: [
        ['variant_id', 'variantId'],
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.fn('DISTINCT', db.sequelize.col('session.visitor_id')),
          ),
          'unique_visitors',
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
        },
      ],
      group: ['SessionExperiment.variant_id'],
      raw: true,
    });

    const formattedStats = stats.map((stat) => ({
      variantId: stat.variantId,
      unique_visitors: parseInt(stat.unique_visitors, 10),
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
        unique_visitors: 0,
        averageSessionTime: '0.00',
        totalSessionTime: '0.00',
      });
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getUniqueUserGoalSessionTimeStats:', error);
    throw error;
  }
}

async function getUniqueUserGoalClickAndPageVisitStats(
  experimentId,
  variantIds,
) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: {
        experiment_id: experimentId,
      },
      attributes: [
        ['variant_id', 'variantId'],
        [
          db.sequelize.fn(
            'COUNT',
            db.sequelize.fn('DISTINCT', db.sequelize.col('session.visitor_id')),
          ),
          'unique_visitors',
        ],
        [
          db.sequelize.fn(
            'SUM',
            db.sequelize.cast(
              db.sequelize.col('SessionExperiment.converted'),
              'integer',
            ),
          ),
          'conversions',
        ],
      ],
      include: [
        {
          model: db.Session,
          as: 'session', // Ensure this matches the correct alias defined in your associations
          attributes: [], // We don't need any attributes from the session table in the final result
        },
      ],
      group: ['SessionExperiment.variant_id'],
      raw: true,
    });

    const formattedStats = stats.map((stat) => {
      const conversionRate = parseFloat(
        ((stat.conversions / stat.unique_visitors) * 100).toFixed(2),
      );
      return {
        variantId: stat.variantId,
        unique_visitors: parseInt(stat.unique_visitors, 10),
        conversions: parseInt(stat.conversions, 10),
        conversionRate: conversionRate,
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
        unique_visitors: 0,
        conversions: 0,
        conversionRate: 0,
      });
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getUniqueUserGoalClickAndPageVisitStats:', error);
    throw error;
  }
}

export default getUniqueUserExperimentStats;
