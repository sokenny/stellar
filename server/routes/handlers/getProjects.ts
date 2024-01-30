import db from '../../models';

async function getProjects(req, res) {
  const { userId } = req.params;
  const projects = await db.Project.findAll({
    where: {
      user_id: userId,
    },
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
            required: false,
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
        order: [['created_at', 'DESC']],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(projects);
}

export default getProjects;
