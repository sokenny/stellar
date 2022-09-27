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
    return {page, browser, statusCode};
}

async function scrap(req: Request, res: Response) {
    
    for(const website of websitesToTest) {
        
        const {page, browser, statusCode} = await initiatePage(website);
        
        if (statusCode !== 200) continue;
        
        const html = await page.content();

        const dom = new jsdom.JSDOM(html);
        const window = dom.window;

        const domHelper = DOMHelper(page, window);
        domHelper.printAppTitle();
        const mainElements:MainElements = await domHelper.retrieveElements();
        console.log('Main elements: ', mainElements);
        console.log(' ');

        // TODO usar el nthChild correctamente en el selector
        const cta = mainElements.cta;
        if(cta) {
            console.log('CTA inner text: ', await cta.evaluate(el => el.textContent));
            console.log('CTA class: ', await cta.evaluate(el => el.className));
            const ctaSelector = await domHelper.getSelector(cta);
            console.log('CTA selector: ', ctaSelector);
        }

        await browser.close();
    }
        
    
    res.status(200).send('Scraping done');
    
}


export default {
    scrap
}


// TODO - cranear bien que queremos hacer despues / donde tiene mas sentido seguir invirtiendo tiempo