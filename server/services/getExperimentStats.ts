import { Sequelize } from 'sequelize';
import GoalTypesEnum from '../helpers/enums/GoalTypesEnum';
import db from '../models';

const goalFunctionMapper = {
  [GoalTypesEnum.SESSION_TIME]: getGoalSessionTimeStats,
  [GoalTypesEnum.CLICK]: () => [],
  [GoalTypesEnum.PAGE_VISIT]: () => [],
};

async function getGoalSessionTimeStats(experimentId, variantIds) {
  const query = `
SELECT 
    (jsonb_array_elements(experiments_run)->>'variant')::int as variant_id, 
    COUNT(id)::int as session_count, 
    ROUND(AVG(length), 0)::int as average_session_time
FROM 
    sessions
WHERE 
    experiments_run @> '[{"experiment": ${experimentId}}]'
GROUP BY 
    variant_id
`;

  const stats = await db.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
  });

  stats.forEach((variantStat) => {
    const index = variantIds.indexOf(variantStat.variant_id);
    if (index > -1) {
      variantIds.splice(index, 1);
    }
  });

  variantIds.forEach((variantId) => {
    stats.push({
      variant_id: variantId,
      session_count: 0,
      average_session_time: 0,
    });
  });

  return stats;
}

async function getExperimentStats(req, res) {
  // TODO-p2 consider adding user_id or project_id key in sessions table to query faster
  // hardcodiando un poco
  const { id } = req.params;

  try {
    const experiment = await db.Experiment.findOne({
      where: {
        id,
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
    const variantStats = await functionToCall(id, variantIds);
    console.log('var stats: ', variantStats);

    res.json(variantStats);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}

export default getExperimentStats;
