import puppeteer from 'puppeteer';
import jsdom from 'jsdom';

import { MainElements } from '../types';
import { IElement, IVariant } from '../types';
import db from '../models';
import { getTextVariants, MAX_TOKENS } from './gpt/getTextVariants';
import DOMHelper from './scrapper/DOMHelper';
import tryOrReturn from '../helpers/tryOrReturn';

export async function initiatePage(website) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const response = await page.goto(website);
  const statusCode = response.status();
  const html = await page.content();
  const dom = new jsdom.JSDOM(html);
  const window = dom.window;
  return { page, browser, statusCode, window };
}

export async function scrapMainElements(
  websiteUrl: string,
  browserSession: any,
): Promise<MainElements | false> {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  return mainElements;
}

export async function getPageContext(website_url: string, browserSession: any) {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  const context = await domHelper.getPageContext();
  console.log('context! ', context);
  return context;
}

export async function findOrCreateProject(website_url: string, transaction) {
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

export async function createVariants(
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
  const variantCount = 1 + variants.length; // Including control variant
  const baseTraffic = Math.floor(100 / variantCount);
  let residualTraffic = 100 - baseTraffic * variantCount;

  for (let i = 0; i < variantCount; i++) {
    const isControl = i === 0;
    let traffic = baseTraffic;

    // Assign residual traffic to the control variant
    if (isControl && residualTraffic > 0) {
      traffic += residualTraffic;
      residualTraffic = 0; // Reset residual traffic after assigning
    }

    const variant: IVariant = await db.Variant.create(
      {
        is_control: isControl,
        element_id: element.id,
        text: isControl ? text : variants[i - 1],
        font_size: null,
        color,
        background_color: null,
        experiment_id: experimentId,
        traffic: traffic,
      },
      {
        transaction,
      },
    );

    variantsForThisElement.push(variant);
  }

  return variantsForThisElement;
}

export async function createExperiments(
  elements,
  journey,
  projectId,
  transaction,
) {
  try {
    const experiments = [];

    for (const element of elements) {
      const experiment = await db.Experiment.create(
        {
          name: `${element.type} Experiment`,
          element_id: element.id,
          journey_id: journey.id,
          project_id: projectId,
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
    }

    return experiments;
  } catch (error) {
    console.error('Error creating experiments:', error);
    throw error;
  }
}

export async function createElements(elements, journeyId, transaction) {
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

export function buildPromptFromPageContext(pageContext, element) {
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
