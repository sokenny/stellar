import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import { DOMHelper, websitesToTest } from '../utils';
import { MainElements } from '../types';
import { IElement, IVariant } from '../types';
import db from '../models';

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
  website_url: string,
  close_browser: boolean = true,
): Promise<MainElements | false> {
  const { page, browser, statusCode, window } = await initiatePage(website_url);
  if (statusCode !== 200) return false;
  const domHelper = DOMHelper(page, window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  if (close_browser) {
    await browser.close();
  }
  return mainElements;
}

async function test(req: Request, res: Response) {
  for (const website of websitesToTest) {
    await scrapMainElements(website);
  }
  res.status(200).send('Testing done');
}

async function findOrCreateProject(website_url: string) {
  const domain = website_url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');

  const project = await db.Project.findOrCreate({
    where: {
      domain
    },
    defaults: {
      name: domain,
      domain
    }
  });

    
  return project[0];
}


async function createVariants(element, experimentId) {
  const variantsForThisElement = [];
  const text = element.properties.innerText; // Assuming properties are already resolved
  const color = element.properties.color;

  for (let i = 0; i < 3; i++) {
    const variant = await db.Variant.create({
      element_id: element.id,
      text: `${text} - ${i}`,
      font_size: null,
      color,
      background_color: null,
      experiment_id: experimentId
    });

    variantsForThisElement.push(variant);
  }

  return variantsForThisElement;
}

async function createExperiments(elements, journeyId) {
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
        journey_id: journeyId,
        url: 'hardcoded url'
      });

      await createVariants(element, experiment.id);
      experiments.push(experiment);

      startDate = new Date(endDate.getTime());
    }

    return experiments;
  } catch (error) {
    console.error('Error creating experiments:', error);
    throw error;
  }
}




async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const { website_url } = req.body;
  console.log("body: ", req.body)
  console.log("WEBSITE URL :", website_url)
  const project = await findOrCreateProject(website_url);
  console.log("proyecto: ", project)
  const mainElements = await scrapMainElements(website_url, false);
  const createdElements = await createElements(
    Object.entries(mainElements).map((element) => ({
      domReference: element[1][0],
      selector: element[1][1],
      type: element[0],
      style: element[1][2],
    })),
    project.id,
  );
  console.log('createdElements: ', createdElements);
  const journey = await db.Journey.create({
    name: 'hardcoded name',
    page: website_url, // Maybe store just the path instead
    project_id: project.id,
  });
  const experiments = await createExperiments(createdElements, journey.id);
  console.log('created experiments: ', experiments);
  res.status(200).send(project);
}

async function createElements(elements, projectId) {
  const createdElements = [];
  for (const element of elements) {
    const createdElement = await db.Element.create({
      type: element.type,
      selector : element.selector,
      properties: { 
        innerText: await element.domReference.evaluate((el:any) =>  el.textContent),
        color: await element.domReference.evaluate((el:any) =>  el.style.color), 
        ...element.style
      },
      project_id: projectId
    });
    createdElements.push(createdElement);
  }
  return createdElements;
}


export default {
  scrapMainElements,
  test,
  onboardNewPage,
};

// TODO-P1 create endpoint GET /journey/:id/ to get all the data for a journey
// TODO-P1 have an actual AI model come up with the text variants
// TODO-P1 detect the main asset of the page (image, video, etc) and create a variant for that
// TODO-P1 create endpoint that takes in an analytics account id and returns all the configured events and goals for that account (?) 
// TODO-P2 - detectar imagen en important area mas grande de X dimensiones (?) 'mainAsset'
