import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';

import { MainElements } from '../../types';
import { IElement, IVariant } from '../../types';
import db from '../../models';
import { getTextVariants, MAX_TOKENS } from '../gpt/getTextVariants';
import DOMHelper from './DOMHelper';
import tryOrReturn from '../../helpers/tryOrReturn';

async function initiatePage(website) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const response = await page.goto(website);
  const statusCode = response.status();
  const html = await page.content();
  const dom = new jsdom.JSDOM(html);
  const window = dom.window;
  return { page, browser, statusCode, window };
}

async function scrapMainElements(
  websiteUrl: string,
  browserSession: any,
): Promise<MainElements | false> {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  return mainElements;
}

async function getPageContext(website_url: string, browserSession: any) {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  const context = await domHelper.getPageContext();
  console.log('context! ', context);
  return context;
}

async function findOrCreateProject(website_url: string, transaction) {
  const domain = website_url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');

  const project = await db.Project.findOrCreate({
    where: {
      domain,
    },
    defaults: {
      name: domain,
      domain,
      user_id: 1,
    },
    transaction,
  });
  return project[0];
}

async function createVariants(
  element: IElement,
  experimentId,
  pageContext,
  transaction,
) {
  const variantsForThisElement = [];
  const text = element.properties.innerText;
  const color = element.properties.color;

  const prompt = buildPromptFromPageContext(pageContext, element);
  const variants = await getTextVariants({ prompt });

  for (let i = 0; i < 3; i++) {
    const isControl = i === 0;
    const variant: IVariant = await db.Variant.create(
      {
        is_control: isControl,
        element_id: element.id,
        text: isControl ? text : variants[i - 1],
        font_size: null,
        color,
        background_color: null,
        experiment_id: experimentId,
      },
      {
        transaction,
      },
    );

    variantsForThisElement.push(variant);
  }

  return variantsForThisElement;
}

async function createExperiments(elements, journey, transaction) {
  try {
    const experiments = [];
    let startDate = new Date();

    for (const element of elements) {
      const endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + 7);

      const experiment = await db.Experiment.create(
        {
          name: `${element.type} Experiment`,
          start_date: startDate,
          end_date: endDate,
          element_id: element.id,
          journey_id: journey.id,
          url: journey.page,
        },
        {
          transaction,
        },
      );

      await createVariants(
        element,
        experiment.id,
        journey.context,
        transaction,
      );
      experiments.push(experiment);

      startDate = new Date(endDate.getTime());
    }

    return experiments;
  } catch (error) {
    console.error('Error creating experiments:', error);
    throw error;
  }
}

async function createElements(elements, journeyId, transaction) {
  const createdElements = [];
  for (const element of elements) {
    const createdElement = await db.Element.create(
      {
        type: element.type,
        selector: element.selector,
        properties: {
          innerText: await tryOrReturn(
            async () =>
              element.domReference.evaluate((el: any) => el.innerText),
            '',
          ),
          color: await tryOrReturn(
            async () =>
              element.domReference.evaluate((el: any) => el.style.color),
            '',
          ),
          ...element.style,
        },
        journey_id: journeyId,
      },
      {
        transaction,
      },
    );
    createdElements.push(createdElement);
  }
  return createdElements;
}

function buildPromptFromPageContext(pageContext, element) {
  return `I am running an A/B test for a "${
    element.type
  }" element on a webpage. I need alternative text variants for this element to compare against the original text. 

Original Text: "${element.properties.innerText}"

Please provide 2 additional text variants specifically in an array format, aiming to enhance page interaction and conversion rates. For instance, the response should be structured like this:

["First alternative text variant", "Second alternative text variant"].

Contextual information:
- Page Body Text: ${pageContext.bodyText}
- Page Title: ${pageContext.metaTitle}
- Page Description: ${pageContext.metaDescription}

Remember, only the array format is acceptable for the response. And be sure to keep the response length under ${
    MAX_TOKENS * 4
  } characters (this should be the absolute max but this does not mean you need to use up to this amount. If you are creating variants on a short text, then a similar length will usually be suitable)!`;
}

async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const transaction = await db.sequelize.transaction();
  try {
    const { website_url } = req.body;
    const project = await findOrCreateProject(website_url, transaction);
    const browserSession = await initiatePage(website_url);
    const mainElements = await scrapMainElements(website_url, browserSession);

    const context = await getPageContext(website_url, browserSession);

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

    await createExperiments(createdElements, journey, transaction);
    await browserSession.browser.close();

    await transaction.commit();
    res.status(200).send(project);
  } catch (error) {
    await transaction.rollback();
    console.error('Error during onboarding:', error);
    res.status(500).send('An error occurred during onboarding');
  }
}

export default onboardNewPage;
