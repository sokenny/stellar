import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import {DOMHelper, websitesToTest} from '../utils';

async function scrap(req: Request, res: Response) {
    
    // for each website in websitesToTest, fetch its contents with puppeteer
    for(const website of websitesToTest) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(website);
        const html = await page.content();
        await browser.close();

        const dom = new jsdom.JSDOM(html);
        const window = dom.window;
        const document = window.document;

        // console.log('Get computed styles: ', window.getComputedStyle(
        //     document.querySelector('h1') as Element
        // ).getPropertyValue('font-size'));

        const domHelper = DOMHelper(document, window);
        domHelper.printAppTitle();
        domHelper.retrieveElements();
        console.log(' ');
        console.log(' ');
    }
        
    
    res.status(200).send('Scraping done');
    
}


export default {
    scrap
}