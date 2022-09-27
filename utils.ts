import { MainElements } from "./types";
import { ElementHandle } from "puppeteer";

export const websitesToTest: string[] = [
    "https://lengaswear.com",
    // "https://www.dipseastories.com/",
    // "https://pinklabel.tv/",
    // "https://www.bitstamp.net/",
    // "https://wallet.uphold.com/",
    // "https://www.gemini.com/share/vrnwe6s8",
    "https://bitcoinira.com/",
    // "https://www.apartments.com/",
    // "https://www.lemonade.com/car",
    // "https://clearcover.com/",
    // 'https://www.autooptimize.ai/'
];

export const loginCtas:string[] = [
    'login',
    'log in',
    'sign in',
    'iniciar sesion',
    'iniciar sesión',
    'ingresar'
]

export const registerCtas:string[] = [
    'register',
    'sign up',
    'create account',
    'crear cuenta',
    'registrarse',
    'registrate',
    'create an account',
    'get started',
    'open account'
]

export const buttonClasses:string[] = [
    'btn',
    'button',
    'cta',
]


// Create class called DOMHelper
export function DOMHelper(page:any, window:any) {

    return {
        isInRelevantScreenArea: async function(element: any):Promise<boolean> {
            const rect:any  = await element.evaluate((el:any) => {
                const {x, y, left, top, width, height} = el.getBoundingClientRect();
                return {x, y, left, top, width, height};
            });
            const windowHeight = (window.innerHeight || page.pageElement.clientHeight);
            const windowWidth = (window.innerWidth || page.pageElement.clientWidth);
            const vertInViewMinus20Percent = (rect.top <= windowHeight * 0.8) && ((rect.top + rect.height) >= windowHeight * .2);
            const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
            return (vertInViewMinus20Percent && horInView);
        },
        isImportantCtaButton: async function(element: ElementHandle): Promise<boolean> {
            const domElementClassName:string = await element.evaluate((el:any) =>  el.className);
            const domElementTextContent:string = await element.evaluate((el:any) =>  el.textContent);
            const hasButtonClass = async () => buttonClasses.some((buttonClass) => domElementClassName.toLocaleLowerCase().includes(buttonClass));
            const isNotLoginCta = async () => !loginCtas.includes(domElementTextContent.toLocaleLowerCase());
            try{
                return await hasButtonClass() && await isNotLoginCta() && await this.isInRelevantScreenArea(element);
            } catch (e) {
                return false;
            }
        },
        getVisibleElementWithNBiggestFontSize: async function (elements: any[], n:number): Promise<HTMLElement> {
            const elementsWithFontSize = [];
            for(const element of elements) {
                const fontSize = await element.evaluate(el => window.getComputedStyle(el).getPropertyValue('font-size'));
                const isVisible = await element.evaluate(el => window.getComputedStyle(el).getPropertyValue('display') !== 'none' && window.getComputedStyle(el).getPropertyValue('opacity') !== '0');
                const isUnder500Chars = await element.evaluate(el => el.textContent.length < 500);
                if (isVisible && isUnder500Chars) {
                    elementsWithFontSize.push({element, fontSize: parseInt(fontSize)});
                }
            }
            elementsWithFontSize.sort((a:any, b:any) => b.fontSize - a.fontSize);
            return elementsWithFontSize[n-1].element;
        },
        getRelevantElementsToScan: async function(elements: HTMLElement[]): Promise<HTMLElement[]> {
            const relevantElements:HTMLElement[] = [];
            for (const element of elements) {
                if (await this.isInRelevantScreenArea(element)){
                    relevantElements.push(element);
                }
            }
            return relevantElements;
        },
        retrieveElements: async function(){
            const mainElements:MainElements = {h1: null, description: null, cta: null};
            const h1 = await page.$('h1');
            const h2 = await page.$('h2');
            let cta = await page.$('button');
            const elements = await page.$$('*');
            const relevantElements = await this.getRelevantElementsToScan(elements);
            for(const element of relevantElements){
                if (await this.isImportantCtaButton(element)) {
                    console.log('IS IMPORTANT!');
                    console.log(await element.evaluate(el => el.textContent));
                    cta = element;
                }
            }
    
            const biggestText = await this.getVisibleElementWithNBiggestFontSize(relevantElements, 1);
            const secondBiggestText = await this.getVisibleElementWithNBiggestFontSize(relevantElements, 2);

            mainElements.h1 = h1 || biggestText;
            mainElements.description = h2 || secondBiggestText;
            mainElements.cta = cta;
            return mainElements;

        },
        printAppTitle: async function() {
            const title = await page.title();
            console.log("Title: ", title);
        },
        getSelector: async function(element: ElementHandle) {
            const selector = await element.evaluate((el:any) => {
                const firstEl = el;
                const elementsInTree = [firstEl];
                // get nth of child of firstEl
                const nthChild = this.getNthChild(firstEl);
                while (el.parentNode) {
                    el = el.parentNode;
                    elementsInTree.push(el);
                    if (el.tagName === 'BODY') {
                        break;
                    }
                }
                let selector = '';
                for (let i = elementsInTree.length - 1; i >= 0; i--) {
                    if(selector === ''){
                        selector = elementsInTree[i].tagName.toLowerCase();
                        continue;   
                    }
                    selector += ' > ' + elementsInTree[i].tagName.toLowerCase();
                }
                console.log('nthChild', nthChild);
                return selector;
            });
            return selector;
        },
        getNthOfChild: function (el:any) {
            let nth = 0;
            while (el.previousElementSibling) {
                el = el.previousElementSibling;
                nth++;
            }
            return nth;
        }
    }
}