import { ElementHandle } from 'puppeteer';
import tryOrReturn from '../../helpers/tryOrReturn';
import { MainElements } from '../../types';
import { buttonClasses, loginCtas } from '../../utils';

export default function DOMHelper(page: any, window: any) {
  return {
    getPageContext: async function () {
      const bodyText = await tryOrReturn<string, string>(async () => {
        const body = await page.$('body');
        return body
          ? await page.evaluate((body) => body.innerText, body)
          : null;
      }, null);

      const metaDescription = await tryOrReturn<string, string>(
        async () =>
          page.$eval('meta[name="description"]', (element) => element.content),
        null,
      );
      const metaTitle = await tryOrReturn<string, string>(
        async () =>
          page.$eval('meta[name="title"]', (element) => element.content),
        null,
      );
      const metaOgTitle = await tryOrReturn<string, string>(
        async () =>
          page.$eval('meta[property="og:title"]', (element) => element.content),
        null,
      );
      const metaOgDescription = await tryOrReturn<string, string>(
        async () =>
          page.$eval(
            'meta[property="og:description"]',
            (element) => element.content,
          ),
        null,
      );

      return {
        bodyText,
        metaTitle: metaTitle || metaOgTitle,
        metaDescription: metaDescription || metaOgDescription,
      };
    },

    isInRelevantScreenArea: async function (element: any): Promise<boolean> {
      const rect: any = await element.evaluate((el: any) => {
        const { x, y, left, top, width, height } = el.getBoundingClientRect();
        return { x, y, left, top, width, height };
      });
      const windowHeight = window.innerHeight || page.pageElement.clientHeight;
      const windowWidth = window.innerWidth || page.pageElement.clientWidth;
      const vertInViewMinus20Percent =
        rect.top <= windowHeight * 0.8 &&
        rect.top + rect.height >= windowHeight * 0.2;
      const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
      return vertInViewMinus20Percent && horInView;
    },
    isImportantCtaButton: async function (
      element: ElementHandle,
    ): Promise<boolean> {
      const domElementClassName: string = await element.evaluate(
        (el: any) => el.className,
      );
      const domElementTextContent: string = await element.evaluate(
        (el: any) => el.textContent,
      );
      const hasButtonClass = async () =>
        buttonClasses.some((buttonClass) =>
          domElementClassName.toLocaleLowerCase().includes(buttonClass),
        );
      const isNotLoginCta = async () =>
        !loginCtas.includes(domElementTextContent.toLocaleLowerCase());
      try {
        return (
          (await hasButtonClass()) &&
          (await isNotLoginCta()) &&
          (await this.isInRelevantScreenArea(element))
        );
      } catch (e) {
        return false;
      }
    },
    getVisibleElementWithNBiggestFontSize: async function (
      elements: any[],
      n: number,
    ): Promise<HTMLElement> {
      const elementsWithFontSize = [];
      for (const element of elements) {
        const fontSize = await element.evaluate((el) =>
          window.getComputedStyle(el).getPropertyValue('font-size'),
        );
        const isVisible = await element.evaluate(
          (el) =>
            window.getComputedStyle(el).getPropertyValue('display') !==
              'none' &&
            window.getComputedStyle(el).getPropertyValue('opacity') !== '0',
        );
        const isUnder500Chars = await element.evaluate(
          (el) => el.textContent.length < 500,
        );
        if (isVisible && isUnder500Chars) {
          elementsWithFontSize.push({ element, fontSize: parseInt(fontSize) });
        }
      }
      elementsWithFontSize.sort((a: any, b: any) => b.fontSize - a.fontSize);
      return elementsWithFontSize[n - 1]?.element;
    },
    getRelevantElementsToScan: async function (
      elements: HTMLElement[],
    ): Promise<HTMLElement[]> {
      const relevantElements: HTMLElement[] = [];
      for (const element of elements) {
        if (await this.isInRelevantScreenArea(element)) {
          relevantElements.push(element);
        }
      }
      return relevantElements;
    },
    getBasicStyles: async function (element): Promise<any> {
      return element.evaluate((el: any) => {
        const style = window.getComputedStyle(el);
        return {
          fontSize: style.getPropertyValue('font-size'),
          fontWeight: style.getPropertyValue('font-weight'),
          color: style.getPropertyValue('color'),
        };
      });
    },
    retrieveElements: async function () {
      const mainElements: any = {};
      const h1 = await page.$('h1');
      const h2 = await page.$('h2');
      let cta = await page.$('button');
      const elements = await page.$$('*');
      const relevantElements = await this.getRelevantElementsToScan(elements);
      for (const element of relevantElements) {
        if (await this.isImportantCtaButton(element)) {
          cta = element;
        }
      }

      const biggestText = await this.getVisibleElementWithNBiggestFontSize(
        relevantElements,
        1,
      );
      const secondBiggestText =
        await this.getVisibleElementWithNBiggestFontSize(relevantElements, 2);

      // TODO-p2: Tambien guardar el 'biggestText' porque muchas veces difiere del h1
      const chosenH1 = h1 || biggestText;
      const chosenDescription = h2 || secondBiggestText;

      const h1Styles = await tryOrReturn(
        async () => await this.getBasicStyles(chosenH1),
        {},
      );
      const h2Styles = await tryOrReturn(
        async () => await this.getBasicStyles(chosenDescription),
        {},
      );
      const ctaStyles = await tryOrReturn(
        async () => await this.getBasicStyles(cta),
        {},
      );

      const chosenH1Selector = await this.getSelector(chosenH1);
      const chosenDescriptionSelector = await this.getSelector(
        chosenDescription,
      );
      const chosenCtaSelector = await this.getSelector(cta);

      console.log('chosenH1Selector:', chosenH1Selector);
      console.log('chosenDescriptionSelector:', chosenDescriptionSelector);
      console.log('chosenCtaSelector:', chosenCtaSelector);

      if (chosenH1 && chosenH1Selector) {
        mainElements.h1 = [chosenH1, chosenH1Selector, h1Styles];
      }
      if (chosenDescription && chosenDescriptionSelector) {
        mainElements.description = [
          chosenDescription,
          chosenDescriptionSelector,
          h2Styles,
        ];
      }
      if (cta && chosenCtaSelector) {
        mainElements.cta = [cta, chosenCtaSelector, ctaStyles];
      }
      return mainElements;
    },
    printAppTitle: async function () {
      const title = await page.title();
      console.log('title:', title);
    },
    getSelector: async function (element: ElementHandle) {
      try {
        const selector = await element.evaluate((el: any) => {
          const getNthChild = function (htmlElement: any) {
            let nth = 1;
            while (htmlElement.previousElementSibling) {
              htmlElement = htmlElement.previousElementSibling;
              nth++;
            }
            return nth;
          };
          const firstEl = el;
          const elementsInTree = [firstEl];
          const nthChild = getNthChild(firstEl);
          while (el.parentNode) {
            el = el.parentNode;
            elementsInTree.push(el);
            if (el.tagName === 'BODY') {
              break;
            }
          }
          let selector = '';
          for (let i = elementsInTree.length - 1; i >= 0; i--) {
            if (selector === '') {
              selector = elementsInTree[i].tagName.toLowerCase();
              continue;
            }
            selector += ' > ' + elementsInTree[i].tagName.toLowerCase();
          }
          selector += ':nth-child(' + nthChild + ')';
          return selector;
        });
        return selector;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  };
}
