import {ElementHandle} from 'puppeteer';

export type MainElements = {
    h1: ElementHandle | null;
    description: ElementHandle | null;
    cta: ElementHandle | null;
};