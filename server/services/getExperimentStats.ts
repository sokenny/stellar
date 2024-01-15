import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import db from '../models';

const goalFunctionMapper = {
  [GoalTypesEnum.SESSION_TIME]: getGoalSessionTimeStats,
  [GoalTypesEnum.CLICK]: getGoalClickAndPageVisitStats,
  [GoalTypesEnum.PAGE_VISIT]: getGoalClickAndPageVisitStats,
};

async function getGoalSessionTimeStats(experimentId, variantIds) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: { experiment_id: experimentId },
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
      sessions: parseInt(stat.sessions, 10),
      averageSessionTime: parseFloat(stat.averageSessionTime).toFixed(2),
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
        conversions: 0,
      });
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getGoalSessionTimeStats:', error);
    throw error;
  }
}

async function getGoalClickAndPageVisitStats(experimentId, variantIds) {
  try {
    const stats = await db.SessionExperiment.findAll({
      where: {
        experiment_id: experimentId,
      },
      attributes: [
        ['variant_id', 'variantId'],
        [db.sequelize.fn('COUNT', db.sequelize.col('session_id')), 'sessions'],
        [
          db.sequelize.fn(
            'SUM',
            db.sequelize.cast(db.sequelize.col('converted'), 'integer'),
          ),
          'conversions',
        ],
      ],
      group: ['variant_id'],
      raw: true,
    });

    const formattedStats = stats.map((stat) => {
      const conversionRate = parseFloat(
        ((stat.conversions / stat.sessions) * 100).toFixed(2),
      );
      return {
        variantId: stat.variantId,
        sessions: parseInt(stat.sessions, 10),
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
        sessions: 0,
        conversions: 0,
        conversionRate: 0,
      });
    });

    return formattedStats;
  } catch (error) {
    console.error('Error in getGoalClickAndPageVisitStats:', error);
    throw error;
  }
}

async function getExperimentStats(experimentId) {
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
        },
        {
          model: db.Goal,
          as: 'goal',
          required: true,
        },
      ],
    });

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

export default getExperimentStats;
