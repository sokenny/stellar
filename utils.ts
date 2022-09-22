import { MainElements } from "./types";

export const websitesToTest: string[] = [
    "https://lengaswear.com",
    "https://www.dipseastories.com/",
    "https://pinklabel.tv/",
    "https://www.bitstamp.net/",
    "https://wallet.uphold.com/",
    "https://www.gemini.com/share/vrnwe6s8",
    "https://bitcoinira.com/",
    "https://www.apartments.com/",
    "https://www.lemonade.com/car",
    "https://clearcover.com/",
    'https://www.autooptimize.ai/'
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
export function DOMHelper(document:any, window:any) {

    return {
        isInRelevantScreenArea: function(element: Element): boolean {
            const rect = element.getBoundingClientRect();
            console.log('rect: ', rect);
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            console.log('windowHeight: ', windowHeight);
            const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
            console.log('windowWidth: ', windowWidth);
            const vertInViewMinus20Percent = (rect.top <= windowHeight * 0.8) && ((rect.top + rect.height) >= windowHeight * .2);
            console.log('vertInViewMinus20Percent: ', vertInViewMinus20Percent);
            const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
            console.log('horInView: ', horInView);
            return (vertInViewMinus20Percent && horInView);
        },
        isImportantCtaButton: function(element: Element): boolean {
            const hasButtonClass = (element:any) => buttonClasses.some((buttonClass) => element.className.toLocaleLowerCase().includes(buttonClass));
            const isNotLoginCta = (element:any) => !loginCtas.includes(element.textContent.toLocaleLowerCase());
            try{
                return hasButtonClass(element) && isNotLoginCta(element) && this.isInRelevantScreenArea(element);
            } catch (e) {
                return false;
            }
        },
        getVisibleElementWithBiggestFontSize: function (elements: HTMLElement[]): HTMLElement {
            let biggestFontSize = 0;
            let biggestFontSizeElement:HTMLElement = elements[0];
            elements.forEach((element) => {
                const fontSize = window.getComputedStyle(element).getPropertyValue('font-size');
                const isVisible = window.getComputedStyle(element).getPropertyValue('display') !== 'none' && window.getComputedStyle(element).getPropertyValue('opacity') !== '0'
                // TODO-p2 check if parent elements are visible
                if (parseInt(fontSize) > biggestFontSize && isVisible) {
                    biggestFontSize = parseInt(fontSize);
                    biggestFontSizeElement = element;
                }
            });
            return biggestFontSizeElement;
        },
        getRelevantElementsToScan: function(elements: HTMLElement[]): HTMLElement[] {
            const relevantElements:HTMLElement[] = [];
            elements.forEach((element) => {
                if (this.isInRelevantScreenArea(element)){
                    relevantElements.push(element);
                }
            });
            return relevantElements;
        },
        retrieveElements: function(){
            const mainElements:MainElements = {h1: null, description: null, button: null};
            let h1 = document.querySelector('h1');
            let button = document.querySelector('button');
            const relevantElements = this.getRelevantElementsToScan(Array.from(document.querySelectorAll('*')));
            console.log('Relevant elements: ', relevantElements);
            const isImportantCtaButton = this.isImportantCtaButton;
            relevantElements.forEach(function(element) {
                if (isImportantCtaButton(element)) {
                    console.log('IS IMPORTANT!');
                    console.log(element?.textContent);
                }
            });
            console.log("H1: ", h1?.textContent);
            console.log("Button", button?.textContent);
    
            const biggestText = this.getVisibleElementWithBiggestFontSize(relevantElements);
            console.log("Biggest text: ", biggestText?.textContent);
        },
        printAppTitle: function() {
            const title = document.querySelector('title');
            console.log(title?.textContent);
        }
    }
}