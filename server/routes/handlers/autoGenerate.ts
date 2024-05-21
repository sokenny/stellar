import { Request, Response } from 'express';
import db from '../../models';
import {
  createExperiments,
  findOrCreateProject,
  getPageContext,
  initiatePage,
  scrapMainElements,
} from '../../services/autoJourney';

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

    await createExperiments(mainElements, page, project.id, transaction);
    await browserSession.browser.close();

    await transaction.commit();
    res.status(200).send({ project });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during onboarding:', error);
    res.status(500).send('An error occurred during onboarding');
  }
}

export default autoGenerate;
