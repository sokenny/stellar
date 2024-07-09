import { ElementHandle } from 'puppeteer';
import tryOrReturn from '../../helpers/tryOrReturn';
import { buttonClasses, loginCtas } from '../../utils';

export default function DOMHelper(page: any, window: any) {
  return {
    getPageContext: async function () {
      const bodyText = await tryOrReturn<string, string>(async () => {
        const body = await page.$('body');
        return body
          ? await page?.evaluate((body) => body.innerText, body)
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
      // const hasButtonClass = async () =>
      //   buttonClasses.some((buttonClass) =>
      //     domElementClassName.toLocaleLowerCase().includes(buttonClass),
      //   );

      function hasCTAText() {
        const pattern =
          /\b(start|get|try|learn|buy|subscribe|sign up|sign in|sign out|log in|log out|register|create|join|discover|explore)\b/i;
        return pattern.test(domElementTextContent);
      }

      const isNotLoginCta = async () =>
        !loginCtas.includes(domElementTextContent.toLocaleLowerCase());
      try {
        return (
          hasCTAText() &&
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

      let [h1, h2, allElements, cta] = await Promise.all([
        page.$('h1'),
        page.$('h2'),
        page.$$('*'),
        page.$('button'),
      ]);

      const relevantElements = await this.getRelevantElementsToScan(
        allElements,
      );

      const ctaChecks = relevantElements.map((element) =>
        this.isImportantCtaButton(element),
      );
      const ctaResults = await Promise.all(ctaChecks);
      for (let i = 0; i < ctaResults.length; i++) {
        if (ctaResults[i]) {
          cta = relevantElements[i];
        }
      }

      const [biggestText, secondBiggestText] = await Promise.all([
        this.getVisibleElementWithNBiggestFontSize(relevantElements, 1),
        this.getVisibleElementWithNBiggestFontSize(relevantElements, 2),
      ]);

      const chosenH1 = h1;
      const chosenBiggestText = biggestText;
      const chosenDescription = h2 || secondBiggestText;

      const [h1Styles, h2Styles, ctaStyles, biggestTextStyles] =
        await Promise.all([
          tryOrReturn(async () => await this.getBasicStyles(chosenH1), {}),
          tryOrReturn(
            async () => await this.getBasicStyles(chosenDescription),
            {},
          ),
          tryOrReturn(async () => await this.getBasicStyles(cta), {}),
          tryOrReturn(
            async () => await this.getBasicStyles(chosenBiggestText),
            {},
          ),
        ]);

      const [
        chosenH1Selector,
        chosenDescriptionSelector,
        chosenCtaSelector,
        chosenBiggestTextSelector,
      ] = await Promise.all([
        this.getSelector(chosenH1),
        this.getSelector(chosenDescription),
        this.getSelector(cta),
        this.getSelector(chosenBiggestText),
      ]);

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

      const [
        chosenBiggestTextText,
        chosenH1Text,
        chosenDescriptionText,
        ctaText,
      ] = await Promise.all([
        chosenBiggestText.evaluate((el) => el.innerText),
        chosenH1.evaluate((el) => el.innerText),
        chosenDescription.evaluate((el) => el.innerText),
        cta.evaluate((el) => el.innerText),
      ]);

      if (
        chosenBiggestText &&
        chosenBiggestTextSelector &&
        chosenBiggestTextText !== chosenH1Text &&
        chosenBiggestTextText !== chosenDescriptionText &&
        chosenBiggestTextText !== ctaText
      ) {
        mainElements.biggestText = [
          chosenBiggestText,
          chosenBiggestTextSelector,
          biggestTextStyles,
        ];
      }

      return mainElements;
    },
    printAppTitle: async function () {
      const title = await page.title();
      console.log('Title:', title);
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
