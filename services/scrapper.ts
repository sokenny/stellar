import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import { DOMHelper, websitesToTest } from '../utils';
import { MainElements } from '../types';
import { IElement, IVariant } from '../types';
import Element from '../models/element';
import Project from '../models/project';
import Variant from '../models/variant';
import Journey from '../models/journey';
import Experiment from '../models/experiment';

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

async function findOrCreateProject(website_url: string): Promise<any> {
  const hardcodedUserId = '5f9f1b0b0b1b9c0b1c1b1b1b';
  const domain = website_url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');
  const project = await Project.findOne({
    domain,
    user: hardcodedUserId,
  });
  if (!project) {
    const newProject = await Project.create({
      name: domain,
      domain,
      user: hardcodedUserId,
    });
    console.log('Created new project: ', newProject);
    return newProject;
  }
  console.log('Project already exists: ', project);
  return project;
}

async function createVariants(
  element: IElement,
  experimentId: any,
): Promise<IVariant[]> {
  const variantsForThisElement = [];
  const text = await element.properties.innerText;
  const color = await element.properties.color;
  for (let i = 0; i < 3; i++) {
    const variant = await Variant.create({
      element: element._id,
      text: text + ' - ' + i,
      fontSize: null,
      color,
      backgroundColor: null,
      experiment: experimentId,
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

async function createExperiments(elements: IElement[], journey_id: any) {
  const experiments = [];
  for (const element of elements) {
    const startDate = getStartDate(experiments);
    const endDate = getEndDate(startDate);
    console.log('start date and end date: ', startDate, endDate)
    const experiment = await Experiment.create({
      name: 'hardcoded name',
      startDate,
      endDate,
      element: element._id,
      journey: journey_id,
      url: 'hardcoded url',
    });
    const variants = await createVariants(element, experiment._id);
    experiment.variants = variants.map((variant) => variant._id);
    await experiment.save();
    experiments.push(experiment);
  }
  return experiments;
}

async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const { website_url } = req.body;
  const project = await findOrCreateProject(website_url);
  const mainElements = await scrapMainElements(website_url, false);
  const createdElements = await createElements(
    Object.entries(mainElements).map((element) => ({
      domReference: element[1],
      type: element[0],
    })),
    project._id,
  );
  console.log('createdElements: ', createdElements);
  const journey = await Journey.create({
    name: 'hardcoded name',
    page: website_url,
    elements: createdElements.map((element) => element._id),
    project: project._id,
  });
  console.log('created journey: ', journey);
  const experiments = await createExperiments(createdElements, journey._id);
  console.log('created experiments: ', experiments);
  journey.experiments = experiments.map((experiment) => experiment._id);
  await journey.save();
  console.log('journey: ', journey);
  res.status(200).send(mainElements);
}

async function createElements(elements: any[], project_id: any) {
  const createdElements = [];
  for (const element of elements) {
    const elementText = await element.domReference.evaluate(
      (el) => el.textContent,
    );
    const elementSelector = await element.domReference.evaluate(
      (el) => el.className,
    );
    const elementColor = await element.domReference.evaluate(
      (el) => el.style.color,
    );
    const elementToCreate: IElement = {
      type: element.type,
      page: 'test',
      selector: elementSelector,
      properties: {
        innerText: elementText,
        color: elementColor,
      },
      project: project_id,
    };
    const createdElement = await Element.create(elementToCreate);
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
