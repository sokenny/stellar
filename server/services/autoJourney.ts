import puppeteer from 'puppeteer';
import jsdom from 'jsdom';

import { MainElements } from '../types';
import { IVariant } from '../types';
import db from '../models';
import { getTextVariants, MAX_TOKENS } from './gpt/getTextVariants';
import DOMHelper from './scrapper/DOMHelper';
import tryOrReturn from '../helpers/tryOrReturn';
import { invalidateCache } from '../helpers/cache';

export async function initiatePage(website) {
  const browser = await puppeteer.launch({
    args: ['--disable-logging'],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1260,
    height: 770,
  });
  const response = await page.goto(website);
  const statusCode = response.status();
  const html = await page.content();
  let window;
  try {
    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on('error', (message) => {
      console.error('Error from JSDOM:', message);
    });
    virtualConsole.on('warn', () => {}); // Ignore warnings

    const dom = new jsdom.JSDOM(html, {
      virtualConsole,
      contentType: 'text/html',
    });

    window = dom.window;
  } catch (error) {
    window = undefined;
  }
  return { page, browser, statusCode, window };
}

export async function scrapMainElements(
  browserSession: any,
): Promise<MainElements | false> {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  return mainElements;
}

export async function getPageContext(browserSession: any) {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  const context = await domHelper.getPageContext();
  return context;
}

export async function findOrCreateProject(
  website_url: string,
  transaction = null,
) {
  const domain = website_url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');

  const [project, created] = await db.Project.findOrCreate({
    where: {
      domain,
    },
    defaults: {
      name: domain,
      domain,
    },
    transaction,
  });

  if (created) {
    await invalidateCache('allowed-origins');
  }

  return project;
}

export async function createVariants(
  element,
  experimentId,
  pageContext,
  transaction,
) {
  const variantsForThisElement = [];
  const text = await element.domReference.evaluate((el: any) => el.innerText);

  const prompt = buildPromptFromPageContext(pageContext, element, text);
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

    const modifications = [
      {
        cssText: element.style.cssText || '',
        selector: element.selector,
        innerText: isControl ? text : variants[i - 1],
      },
    ];

    const variant: IVariant = await db.Variant.create(
      {
        is_control: isControl,
        experiment_id: experimentId,
        traffic,
        modifications,
        name: isControl ? 'Control' : `Variant ${i}`,
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
  mainElementsObject,
  page,
  projectId,
  transaction,
) {
  const elements = Object.entries(mainElementsObject).map((element) => ({
    domReference: element[1][0],
    selector: element[1][1],
    style: element[1][2],
    type: element[0],
  }));

  try {
    const experimentPromises = elements.map((element) =>
      createExperiment(element, projectId, page, transaction),
    );
    const experiments = await Promise.all(experimentPromises);

    for (let i = 1; i < experiments.length; i++) {
      await db.Experiment.update(
        { queue_after: experiments[i - 1].id },
        {
          where: { id: experiments[i].id },
          transaction,
        },
      );
    }

    return experiments;
  } catch (error) {
    console.error('Error creating and updating experiments:', error);
    throw error;
  }
}

async function createExperiment(element, projectId, page, transaction) {
  const experiment = await db.Experiment.create(
    {
      name: `${element.type} Experiment`,
      project_id: projectId,
      page_id: page.id,
      url: page.url,
      queue_after: null, // Initially set to null
    },
    { transaction },
  );

  const variants = await createVariants(
    element,
    experiment.id,
    page.context,
    transaction,
  );
  experiment.variants = variants;

  return experiment;
}

export async function createElements(elements, pageId, transaction) {
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
        page_id: pageId,
      },
      {
        transaction,
      },
    );
    createdElements.push(createdElement);
  }
  return createdElements;
}

export function buildPromptFromPageContext(pageContext, element, text) {
  return `I am running an A/B test for a "${
    element.type
  }" element on a webpage. I need alternative text variants for this element to compare against the original text. 

Original Text: "${text}"

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
