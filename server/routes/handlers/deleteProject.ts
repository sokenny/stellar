import { Op } from 'sequelize';
import db from '../../models';

async function deleteProject(req, res) {
  const projectId = req.params.projectId;

  const transaction = await db.sequelize.transaction();

  try {
    await db.ApiKey.findAll({
      where: {
        project_id: projectId,
      },
      transaction,
    });

    const pages = await db.Page.findAll({
      where: {
        project_id: projectId,
      },
      transaction,
    });

    const experiments = await db.Experiment.findAll({
      where: {
        page_id: {
          [Op.in]: pages.map((page) => page.id),
        },
      },
      transaction,
    });

    await db.SessionExperiment.destroy({
      where: {
        experiment_id: {
          [Op.in]: experiments.map((experiment) => experiment.id),
        },
      },
      transaction,
    });

    await db.Variant.destroy({
      where: {
        experiment_id: {
          [Op.in]: experiments.map((experiment) => experiment.id),
        },
      },
      transaction,
    });

    await db.Goal.destroy({
      where: {
        experiment_id: {
          [Op.in]: experiments.map((experiment) => experiment.id),
        },
      },
      transaction,
    });

    await db.Experiment.destroy({
      where: {
        page_id: {
          [Op.in]: pages.map((page) => page.id),
        },
      },
      transaction,
    });

    await db.Element.destroy({
      where: {
        page_id: {
          [Op.in]: pages.map((page) => page.id),
        },
      },
      transaction,
    });

    await db.Page.destroy({
      where: {
        project_id: projectId,
      },
      transaction,
    });

    await db.Project.destroy({
      where: {
        id: projectId,
      },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      message: 'Project deleted',
    });
  } catch (e) {
    await transaction.rollback();
    console.log('error! ', e);
    return res.status(500).json({
      error: e,
    });
  }
}

export default deleteProject;
