import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';

import { MainElements } from '../../types';
import { IElement, IVariant } from '../../types';
import db from '../../models';
import { getTextVariants } from '../gpt/getTextVariants';
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

async function findOrCreateProject(website_url: string) {
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
    },
  });
  return project[0];
}

async function createVariants(element: IElement, experimentId, pageContext) {
  const variantsForThisElement = [];
  const text = element.properties.innerText;
  const color = element.properties.color;

  const prompt = buildPromptFromPageContext(pageContext, element);
  const variants = await getTextVariants({ prompt });

  for (let i = 0; i < 3; i++) {
    const isControl = i === 0;
    const variant: IVariant = await db.Variant.create({
      is_control: isControl,
      element_id: element.id,
      text: isControl ? text : variants[i - 1],
      font_size: null,
      color,
      background_color: null,
      experiment_id: experimentId,
    });

    variantsForThisElement.push(variant);
  }

  return variantsForThisElement;
}

async function createExperiments(elements, journey) {
  try {
    const experiments = [];
    let startDate = new Date();

    for (const element of elements) {
      const endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + 7);

      const experiment = await db.Experiment.create({
        name: `${element.type} Experiment`,
        start_date: startDate,
        end_date: endDate,
        element_id: element.id,
        journey_id: journey.id,
        url: journey.page,
      });

      await createVariants(element, experiment.id, journey.context);
      experiments.push(experiment);

      startDate = new Date(endDate.getTime());
    }

    return experiments;
  } catch (error) {
    console.error('Error creating experiments:', error);
    throw error;
  }
}

async function createElements(elements, journeyId) {
  const createdElements = [];
  for (const element of elements) {
    const createdElement = await db.Element.create({
      type: element.type,
      selector: element.selector,
      properties: {
        innerText: await tryOrReturn(
          async () => element.domReference.evaluate((el: any) => el.innerText),
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
    });
    createdElements.push(createdElement);
  }
  return createdElements;
}

function buildPromptFromPageContext(pageContext, element) {
  return `I am creating an A/B test for a page in my website. I am creating variants for an element of type "${element.type}"
    
    I will now give you some context about the page so you understand what it is about:

    [Page Text Content]: ${pageContext.bodyText}.
    [Page Title]: ${pageContext.metaTitle}.
    [Page Description]: ${pageContext.metaDescription}.

    The element's current text is: "${element.properties.innerText}".

    Give me 2 more variants for this element. The aim of course, is to increase the conversion rate / interaction of the page.

    The format of the answer should be an array of strings, each string being a variant. For example: ["variant 1", "variant 2"].

    `;
}

// TODO: Have the onboarding be a transaction
async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const { website_url } = req.body;
  const project = await findOrCreateProject(website_url);
  const browserSession = await initiatePage(website_url);
  const mainElements = await scrapMainElements(website_url, browserSession);

  const context = await getPageContext(website_url, browserSession);

  const journey = await db.Journey.create({
    name: 'Journey for ' + project.name,
    page: website_url, // Maybe store just the path instead
    project_id: project.id,
    context,
  });

  const createdElements = await createElements(
    Object.entries(mainElements).map((element) => ({
      domReference: element[1][0],
      selector: element[1][1],
      type: element[0],
      style: element[1][2],
    })),
    journey.id,
  );

  await createExperiments(createdElements, journey);
  browserSession.browser.close();
  res.status(200).send(project);
}

export default onboardNewPage;
