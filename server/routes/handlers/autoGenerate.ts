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

// TODO-p1-1: Make sure the screenshot is not a cropping, rather the full screen scrolled to the element. ITs being tricky but find a way to do it.
// TODO-p1-2: Have autoGenerate create experiments with a queue_after value defined for queued exps
// TODO-p1-3: Prevent exps with duplicated innerText from being created (usually happens when biggestText matches h1 text)

async function autoGenerate(req: Request, res: Response): Promise<void> {
  const transaction = await db.sequelize.transaction();
  try {
    const { url } = req.body;
    console.log('url:', url);
    const project = await findOrCreateProject(url, transaction);
    const browserSession = await initiatePage(url);
    const mainElements = await scrapMainElements(browserSession);

    const context = await getPageContext(browserSession);

    let page = await db.Page.findOne({
      where: { project_id: project.id, url: url },
    });

    if (!page) {
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
    const experiments = await createExperiments(
      mainElements,
      page,
      project.id,
      transaction,
    );

    console.log('experiments created! ', experiments[0]);
    // console.log('variants! ', experiments[0]?.variants[0]);

    await browserSession.browser.close();

    // We initiate 3 parallel sessions to take screenshots of the main elements. And we need to do it asap because popups may appear
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
        const thisVariants = thisExperiment.variants.filter(
          (variant) => !variant.is_control,
        );
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
    res.status(200).send({ project });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during onboarding:', error);
    res.status(500).send('An error occurred during onboarding');
  }
}

export default autoGenerate;
