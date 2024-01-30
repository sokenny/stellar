import { Request, Response } from 'express';
import db from '../../models';
import {
  createElements,
  createExperiments,
  findOrCreateProject,
  getPageContext,
  initiatePage,
  scrapMainElements,
} from '../../services/autoJourney';

async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const transaction = await db.sequelize.transaction();
  try {
    const { website_url } = req.body;
    const project = await findOrCreateProject(website_url, transaction);
    const browserSession = await initiatePage(website_url);
    const mainElements = await scrapMainElements(browserSession);

    const context = await getPageContext(browserSession);

    const journey = await db.Journey.create(
      {
        name: 'Journey for ' + project.name,
        page: website_url,
        project_id: project.id,
        context,
      },
      { transaction },
    );

    const createdElements = await createElements(
      Object.entries(mainElements).map((element) => ({
        domReference: element[1][0],
        selector: element[1][1],
        type: element[0],
        style: element[1][2],
      })),
      journey.id,
      transaction,
    );

    const createdExperiments = await createExperiments(
      createdElements,
      journey,
      project.id,
      transaction,
    );

    await journey.update(
      {
        experiments_order: createdExperiments.map(
          (experiment) => experiment.id,
        ),
      },
      { transaction },
    );

    await browserSession.browser.close();

    await transaction.commit();
    res.status(200).send({ project, journey });
  } catch (error) {
    await transaction.rollback();
    console.error('Error during onboarding:', error);
    res.status(500).send('An error occurred during onboarding');
  }
}

export default onboardNewPage;
