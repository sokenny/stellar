import db from '../../models';

async function getProjects(req, res) {
  const { userEmail } = req.params;
  const user = await db.User.findOne({
    where: {
      email: userEmail,
    },
    include: [
      {
        model: db.Project,
        as: 'projects',
        include: [
          {
            model: db.Experiment,
            as: 'experiments',
            where: {
              deleted_at: null,
            },
            required: false,
            include: [
              {
                model: db.Variant,
                as: 'variants',
                required: false,
                where: {
                  deleted_at: null,
                },
              },
              {
                model: db.Goal,
                as: 'goal',
                required: false,
              },
              {
                model: db.TargetRule,
                as: 'targetRules',
                required: false,
                through: { attributes: [] },
              },
            ],
          },
        ],
        order: [[db.Experiment, 'id', 'DESC']],
      },
      {
        model: db.ApiKey,
        as: 'api_keys',
      },
      {
        model: db.OnboardingAnswer,
        required: false,
        as: 'onboardingAnswer',
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(user);
}

export default getProjects;
