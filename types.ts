import {ElementHandle} from 'puppeteer';

export type MainElements = {
    h1: ElementHandle | null;
    description: ElementHandle | null;
    cta: ElementHandle | null;
};

export interface IElementProperties {
    innerText: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
}

export interface IElement {
    _id?: string;
    type: string;
    page: string;
    selector: string;
    properties: IElementProperties;
    project: any;
}

export interface IProject {
    name: string;
    domain: string;
    user: any;
}

export interface IExperiment {
    name: string;
    startDate: Date;
    endDate: Date;
    element: any;
    variants: string[];
    journey: any;
    url: string;
}

export interface IVariant {
    _id?: string;
    element: any;
    text: string;
    fontSize: string;
    color: string;
    backgroundColor: string;
    experiment: any;
}

export interface IJourney {
    name: string;
    page: string;
    experiments: any[];
    project: any;
}