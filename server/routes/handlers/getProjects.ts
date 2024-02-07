import db from '../../models';

async function getProjects(req, res) {
  const { userEmail } = req.params;
  const projects = await db.User.findOne({
    where: {
      email: userEmail,
    },
    include: [
      {
        model: db.Project,
        as: 'projects',
        // TODO: add deleted_at to projects and uncomment this
        // where: {
        //   deleted_at: null,
        // },
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
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.json(projects);
}

export default getProjects;
