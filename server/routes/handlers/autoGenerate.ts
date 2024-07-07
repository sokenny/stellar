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

// TODO-p1-1: Si alguien pone url de un project que ya existe en el autogenerate, que cree uno nuevo o que no traiga los exps creados anteriormente
async function autoGenerate(req: Request, res: Response): Promise<void> {
  const start = Date.now();
  const transaction = await db.sequelize.transaction();
  try {
    const { url } = req.body;
    console.log('url:', url);

    const [project, browserSession] = await Promise.all([
      findOrCreateProject(url, transaction),
      initiatePage(url),
    ]);

    const mainElementsPromise = scrapMainElements(browserSession);
    const contextPromise = getPageContext(browserSession);

    let page = await db.Page.findOne({
      where: { project_id: project.id, url: url },
    });

    console.log('Hay page !: ', page);

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

    // Await main elements scraping
    const mainElements = await mainElementsPromise;

    const experimentsPromise = createExperiments(
      mainElements,
      page,
      project.id,
      transaction,
    );

    // We initiate 3 parallel sessions to take screenshots of the main elements.
    // And we need to do it asap because popups may appear
    const experiments = await experimentsPromise;

    await browserSession.browser.close();

    await Promise.all(
      Object.keys(mainElements).map(async (key) => {
        const thisExperiment = experiments.find((experiment) =>
          experiment.name.includes(key),
        );
        const snapshotBrowserSession = await initiatePage(url);
        const selector = mainElements[key][1];
        await highlightAndCapture({
          session: snapshotBrowserSession,
          selector,
          fileName: `experiment-${thisExperiment.id}.png`,
        });
        await snapshotBrowserSession.browser.close();

        const thisVariants = thisExperiment.variants.filter(
          (variant) => !variant.is_control,
        );

        // Parallelize the variant snapshots
        await Promise.all(
          thisVariants.map(async (variant) => {
            const variantSnapshotBrowserSession = await initiatePage(url);
            await highlightAndCapture({
              session: variantSnapshotBrowserSession,
              selector,
              fileName: `experiment-${thisExperiment.id}var${variant.id}.png`,
              modifications: variant.modifications,
            });
            await variantSnapshotBrowserSession.browser.close();
          }),
        );
      }),
    );

    await transaction.commit();

    const end = Date.now();
    console.log('-----Time taken:', end - start);

    res.status(200).send({ project });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during onboarding:', error);
    res.status(500).send('An error occurred during onboarding');
  }
}

export default autoGenerate;
