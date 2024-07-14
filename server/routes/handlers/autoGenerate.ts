import { Request, Response } from 'express';
import db from '../../models';
import {
  createExperiments,
  findOrCreateProject,
  getPageContext,
  initiatePage,
  scrapMainElements,
} from '../../services/autoJourney';
import highlightAndCapture from '../../helpers/highlightAndCapture';

// TODO-p2: Consider adding further experiments that involve font-size or button bg color changes. Maybe not for v1
async function autoGenerate(req: Request, res: Response): Promise<void> {
  const start = Date.now();
  const { url } = req.body;

  const transaction = await db.sequelize.transaction();
  try {
    const [project, browserSession] = await Promise.all([
      findOrCreateProject(url, transaction),
      initiatePage(url),
    ]);

    const mainElementsPromise = scrapMainElements(browserSession);
    const contextPromise = getPageContext(browserSession);

    let page = await db.Page.findOne({
      where: { project_id: project.id, url: url },
    });

    if (!page) {
      console.log('no hay page, creamos');
      const context = await contextPromise;
      page = await db.Page.create(
        {
          name: 'Page sample name',
          url: url,
          project_id: project.id,
          context,
        },
        { transaction },
      );
    }

    console.log('page created');

    const mainElements = await mainElementsPromise;

    console.log('main elements scraped');

    const experimentsPromise = createExperiments(
      mainElements,
      page,
      project.id,
      transaction,
    );

    const experiments = await experimentsPromise;

    console.log('experiments created');

    for (const key of Object.keys(mainElements)) {
      const thisExperiment = experiments.find((experiment) =>
        experiment.name.includes(key),
      );
      const selector = mainElements[key][1];
      await highlightAndCapture({
        session: browserSession,
        selector,
        fileName: `experiment-${thisExperiment.id}.png`,
      });
    }

    console.log('control variants snapshots taken');

    await transaction.commit();

    const end = Date.now();
    console.log('-----Time taken:', end - start);

    await captureNonControlVariants(experiments, mainElements, browserSession);

    res.status(200).send({ project });
  } catch (error) {
    await transaction.rollback();
    console.error('Error auto generating experiments:', error);

    try {
      const [project, browserSession] = await Promise.all([
        findOrCreateProject(url),
        initiatePage(url),
      ]);

      const context = await getPageContext(browserSession);

      await db.Page.create({
        name: 'Page sample name',
        url: url,
        project_id: project.id,
        context,
      });

      await browserSession.browser.close();

      res.status(200).send({ project });
    } catch (error) {
      console.error('Error creating project and page:', error);
      res.status(500).send({ error: 'Error creating project and page' });
    }
  }
}

async function captureNonControlVariants(
  experiments,
  mainElements,
  browserSession,
) {
  console.log('capturing non control variants');
  try {
    for (const key of Object.keys(mainElements)) {
      const thisExperiment = experiments.find((experiment) =>
        experiment.name.includes(key),
      );
      const selector = mainElements[key][1];

      const thisVariants = thisExperiment.variants.filter(
        (variant) => !variant.is_control,
      );

      for (const variant of thisVariants) {
        await highlightAndCapture({
          session: browserSession,
          selector,
          fileName: `experiment-${thisExperiment.id}var${variant.id}.png`,
          modifications: variant.modifications,
        });
      }
    }
  } catch (error) {
    console.error('Error capturing non control variants:', error);
  } finally {
    await browserSession.browser.close();
  }
}

export default autoGenerate;
