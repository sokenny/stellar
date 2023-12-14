import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import { DOMHelper, websitesToTest } from '../../utils';
import { MainElements } from '../../types';
import { IElement, IVariant } from '../../types';
import db from '../../models';
import getTextVariants, { generateAiTextResponse } from '../getTextVariants';

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
  browserSession: any

): Promise<MainElements | false> {
  console.log("website url: ", websiteUrl)
  console.log("papito dos")
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  return mainElements;
}

async function getPageContext(website_url: string, browserSession: any) {
//   const { page, browser, statusCode, window } = await initiatePage(website_url);
//   if (statusCode !== 200) return false;
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  const context = await domHelper.getPageContext()
  console.log("context! ", context)
  return context;
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
  console.log("compleamos findOrCreateProject")
  return project[0];
}


async function createVariants(element, experimentId) {
  const variantsForThisElement = [];
  const text = element.properties.innerText; // Assuming properties are already resolved
  const color = element.properties.color;

  for (let i = 0; i < 3; i++) {
    const isControl = i === 0;
    const variant = await db.Variant.create({
      is_control: isControl,
      element_id: element.id,
      text: isControl ? text : `${text} ${i}`,
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

async function createElements(elements, journeyId) {
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
      journey_id: journeyId
    });
    createdElements.push(createdElement);
  }
  return createdElements;
}

async function onboardNewPage(req: Request, res: Response): Promise<void> {
    console.log("papito!")
    const { website_url } = req.body;
    const project = await findOrCreateProject(website_url);
    console.log("breadcrumbb one!")
    const browserSession = await initiatePage(website_url);
    const mainElements = await scrapMainElements(website_url, browserSession);
    console.log("breadcrumbb two!")
  
    const context = await getPageContext(website_url, browserSession);
  
    console.log("context to insert: ", context)
  
    const journey = await db.Journey.create({
      name: 'hardcoded name',
      page: website_url, // Maybe store just the path instead
      project_id: project.id,
      context
    });
  
    console.log("journey created man")
  
    // elements should have journey_id instead of project_id
    const createdElements = await createElements(
      Object.entries(mainElements).map((element) => ({
        domReference: element[1][0],
        selector: element[1][1],
        type: element[0],
        style: element[1][2],
      })),
      journey.id,
    );
  
    await createExperiments(createdElements, journey.id);
    browserSession.browser.close();
    res.status(200).send(project);
  }

export default onboardNewPage;