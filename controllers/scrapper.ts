import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import {DOMHelper, websitesToTest} from '../utils';
import { MainElements } from "../types";

async function initiatePage(website){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto(website);
    const statusCode = response.status();
    const html = await page.content();
    const dom = new jsdom.JSDOM(html);
    const window = dom.window;
    return {page, browser, statusCode, window};
}

async function scrapMainElements(website:string):Promise<MainElements | false>{
    const {page, browser, statusCode, window} = await initiatePage(website);
    if (statusCode !== 200) return false;
    const domHelper = DOMHelper(page, window);
    domHelper.printAppTitle();
    const mainElements:MainElements = await domHelper.retrieveElements();
    console.log('Main elements: ', mainElements);
    console.log(' ');
    const cta = mainElements.cta;
    if(cta) {
        console.log('CTA inner text: ', await cta.evaluate(el => el.textContent));
        console.log('CTA class: ', await cta.evaluate(el => el.className));
        const ctaSelector = await domHelper.getSelector(cta);
        console.log('CTA selector: ', ctaSelector);
    }
    await browser.close();
    return mainElements;    
}

async function test(req: Request, res: Response){
    for(const website of websitesToTest){
        await scrapMainElements(website);
    }
    res.status(200).send('Testing done');
}

async function onboardNewPage(req: Request, res: Response){
    console.log('body: ', req.body);
    const {website} = req.body;
    const mainElements = await scrapMainElements(website);
    res.status(200).send(mainElements);
}

export default {
    scrapMainElements,
    test,
    onboardNewPage
}

// TODO-P1 add origin and push
// TODO-P1 - Create function 'onboardWebsite' that will:
// -scrapMainElements from website
// -for each mainElement retrieved, create an ELEMENT (must have unique selector for each domain + page).
// -for each element created, create 3 variants with AI (for now we hardcode).
// -for each element create an EXPERIMENT.
// -create a JOURNEY that sorts the experiments in order of relevance: h1? -> mainAsset? -> h2? -> cta?
// TODO-P2 - detectar imagen en important area mas grande de X dimensiones (?) 'mainAsset'