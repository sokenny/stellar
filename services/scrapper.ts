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

  const projects = await db.Project.findAll();

  const newProject = await db.Project.create({
    name: domain,
    domain
  });

  console.log("new ", newProject)
    
  console.log("projects: ", projects.length)

  return projects;
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


function getEndDate(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14);
  return endDate;
}

function getStartDate(experiments: any[]) {
  const today = new Date();
  const startDate =
    experiments.length === 0 ? today : experiments.slice(-1)[0].endDate;
  return startDate;
}

async function createExperiments(elements, journeyId) {
  const experiments = [];
  for (const element of elements) {
    const startDate = getStartDate(experiments);
    const endDate = getEndDate(startDate);
    
    const experiment = await db.Experiment.create({
      name: 'hardcoded name',
      start_date: startDate,
      end_date: endDate,
      element_id: element.id,
      journey_id: journeyId,
      url: 'hardcoded url'
    });

    const variants = await createVariants(element, experiment.id);
    experiments.push(experiment);
  }
  return experiments;
}


async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const { website_url } = req.body;
  console.log("body: ", req.body)
  console.log("WEBSITE URL :", website_url)
  const project = await findOrCreateProject(website_url);
  // return
  // const mainElements = await scrapMainElements(website_url, false);
  // const createdElements = await createElements(
  //   Object.entries(mainElements).map((element) => ({
  //     domReference: element[1],
  //     type: element[0],
  //   })),
  //   project.id,
  // );
  // console.log('createdElements: ', createdElements);
  // const journey = await db.Journey.create({
  //   name: 'hardcoded name',
  //   page: website_url,
  //   elements: createdElements.map((element) => element.id),
  //   project: project.id,
  // });
  // console.log('created journey: ', journey);
  // const experiments = await createExperiments(createdElements, journey.id);
  // console.log('created experiments: ', experiments);
  // // journey.experiments = experiments.map((experiment) => experiment.id);
  // await journey.save();
  // console.log('journey: ', journey);
  // res.status(200).send(mainElements);
  res.status(200).send(project);
}

async function createElements(elements, projectId) {
  const createdElements = [];
  console.log("project id que llega: ", projectId)
  for (const element of elements) {
    console.log("creando element: ", element)
    const createdElement = await db.Element.create({
      type: element.type,
      page: 'test',
      selector: element?.selector || "juanito",
      properties: { // Assuming properties is a JSON object
        innerText: element?.properties?.innerText,
        color: element?.properties?.color
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
