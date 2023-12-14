import {ElementHandle} from 'puppeteer';

export type MainElements = {
    h1: [ElementHandle | null, string | null, Record<string, any>];
    description: [ElementHandle | null, string | null, Record<string, any>];
    cta: [ElementHandle | null, string | null, Record<string, any>];
};

export interface IElementProperties {
    innerText: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
}

export interface IElement {
    id?: number;
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
    id?: number;
    element: any;
    text: string;
    font_size: string;
    color: string;
    background_color: string;
    experiment_id: number;
    is_control: boolean;
}

export interface IJourney {
    name: string;
    page: string;
    experiments: any[];
    project: any;
}