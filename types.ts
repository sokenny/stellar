import {ElementHandle} from 'puppeteer';

export type MainElements = {
    h1: ElementHandle | null;
    description: ElementHandle | null;
    cta: ElementHandle | null;
};

export interface IElementProperties {
    innerText: string;
    fontSize: string;
    color: string;
    backgroundColor: string;
}

export interface IElement {
    type: string;
    page: string;
    selector: string;
    properties: IElementProperties;
    project: any;
}
