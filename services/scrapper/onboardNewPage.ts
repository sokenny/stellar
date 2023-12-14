import puppeteer from 'puppeteer';
import { Request, Response } from 'express';
import jsdom from 'jsdom';
import { websitesToTest } from '../../utils';

import { MainElements } from '../../types';
import { IElement, IVariant } from '../../types';
import db from '../../models';
import { getTextVariants } from '../gpt/getTextVariants';
import DOMHelper from './DOMHelper';
import tryOrReturn from '../../helpers/tryOrReturn';

async function initiatePage(website) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const response = await page.goto(website);
  const statusCode = response.status();
  const html = await page.content();
  const dom = new jsdom.JSDOM(html);
  const window = dom.window;
  return { page, browser, statusCode, window };
}

async function scrapMainElements(
  websiteUrl: string,
  browserSession: any,
): Promise<MainElements | false> {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  domHelper.printAppTitle();
  const mainElements: MainElements = await domHelper.retrieveElements();
  return mainElements;
}

async function getPageContext(website_url: string, browserSession: any) {
  const domHelper = DOMHelper(browserSession.page, browserSession.window);
  const context = await domHelper.getPageContext();
  console.log('context! ', context);
  return context;
}

async function findOrCreateProject(website_url: string) {
  const domain = website_url
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '');

  const project = await db.Project.findOrCreate({
    where: {
      domain,
    },
    defaults: {
      name: domain,
      domain,
    },
  });
  return project[0];
}

async function createVariants(element: IElement, experimentId, pageContext) {
  const variantsForThisElement = [];
  const text = element.properties.innerText;
  const color = element.properties.color;

  const prompt = buildPromptFromPageContext(pageContext, element);
  const variants = await getTextVariants({ prompt });

  for (let i = 0; i < 3; i++) {
    const isControl = i === 0;
    const variant: IVariant = await db.Variant.create({
      is_control: isControl,
      element_id: element.id,
      text: isControl ? text : variants[i - 1],
      font_size: null,
      color,
      background_color: null,
      experiment_id: experimentId,
    });

    variantsForThisElement.push(variant);
  }

  return variantsForThisElement;
}

async function createExperiments(elements, journey) {
  try {
    const experiments = [];
    let startDate = new Date();

    for (const element of elements) {
      const endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + 7);

      const experiment = await db.Experiment.create({
        name: `${element.type} Experiment`,
        start_date: startDate,
        end_date: endDate,
        element_id: element.id,
        journey_id: journey.id,
      });

      await createVariants(element, experiment.id, journey.context);
      experiments.push(experiment);

      startDate = new Date(endDate.getTime());
    }

    return experiments;
  } catch (error) {
    console.error('Error creating experiments:', error);
    throw error;
  }
}

async function createElements(elements, journeyId) {
  const createdElements = [];
  for (const element of elements) {
    const createdElement = await db.Element.create({
      type: element.type,
      selector: element.selector,
      properties: {
        innerText: await tryOrReturn(
          async () => element.domReference.evaluate((el: any) => el.innerText),
          '',
        ),
        color: await tryOrReturn(
          async () =>
            element.domReference.evaluate((el: any) => el.style.color),
          '',
        ),
        ...element.style,
      },
      journey_id: journeyId,
    });
    createdElements.push(createdElement);
  }
  return createdElements;
}

function buildPromptFromPageContext(pageContext, element) {
  return `I am creating an A/B test for a page in my website. I am creating variants for an element of type "${element.type}"
    
    I will now give you some context about the page so you understand what it is about:

    [Page Text Content]: ${pageContext.bodyText}.
    [Page Title]: ${pageContext.metaTitle}.
    [Page Description]: ${pageContext.metaDescription}.

    The element's current text is: "${element.properties.innerText}".

    Give me 2 more variants for this element. The aim of course, is to increase the conversion rate / interaction of the page.

    The format of the answer should be an array of strings, each string being a variant. For example: ["variant 1", "variant 2"].

    `;
}

const mockCTX = {
  bodyText:
    'FREE TRIAL\nLet us tell you\na sexy story.\n\nOur stories open up space for you to explore your desires and fantasies on your terms. If your intuition whispered "yes" to that, you\'re in the right place.\n\nSTART A FREE TRIAL\n\nWELCOME TO OUR UNIVERSE\n\nUnlock your sensuality with a subscription to an \never-growing collection of sexy audio stories, \nwellness sessions, and dreamy sleep scenes.\n\nSTART A FREE TRIAL\nEveryone\'s into something. Discover stories for you.\n\nExplore what you already like, or might be into. From professors to the neighbor down the hall. From meet-cutes to off-limits hookups. For solo play or sleepy time. Our universe of stories suits a wide range of preferences, so you can discover exactly what lights you up.\n\nLEARN HOW WE MAKE STORIES\n\nPREVIEW NOW\n\nWild Hearts\n\nHER + HER\n\n4:23\n8:43\n\nPREVIEW NOW\n\nEighty Six\n\nHER + HIM\n\n3:12\n7:10\n\nPREVIEW NOW\n\nGet Intimate With James\n\nHIM + YOU\n\n1:41\n9:53\n\nPREVIEW NOW\n\nSwipe Right\n\nHER + HER + HIM\n\n3:34\n6:58\n\nYOU DON’T HAVE TO TAKE OUR WORD FOR IT\n\n“Life-changing. This app is so thoroughly consensual that I’m able to finally relax and enjoy myself.”\n\nMAYA - 10.24.21\n\n“With so many different stories, themes, and voices to choose from, I feel so free and invited to explore my sexuality in the best way.”\n\nWHITNEY - 09.18.21\n\n“As a woman in the trauma healing process, this app helped me feel so amazing. I have less feelings of shame and guilt because of Dipsea.”\n\nLIZZIE - 11.04.21\n\n“I love how varied and queer-friendly this app is. The characters feel like real, interesting people and that’s what makes them so compelling.”\n\nJAHNAVI - 08.25.21\n\n“These stories allow an escape into the body—a time to focus on yourself and re-energize. It truly is a form of healing and therapy.”\n\nAKA - 1.19.21\n\n“Sensual and super sexy stories created by humans that ACTUALLY explore the inner workings of the human psyche. Guaranteed to get you off and put you to sleep.”\n\nLEISHA - 12.15.20\n\nSPOTLIGHT ON\n\nTrace Lysette’s new series celebrates trans women’s love and pleasure\n\nYou may know Trace Lysette from her scene-stealing roles as Tracey in Jennifer Lopez’s Hustlers and Shae in HBO’s Transparent. Or maybe from her buzzy new film Monica. Now, she\'s the star and co-producer of "Close Up," a three-part Dipsea series celebrating trans women’s love and pleasure.\n\nDISCOVER OUR COLLAB\nMeet Our Very First Vampire Hunk\n\nSink your teeth into the erotic vampire series, “Night School.” When grad student Helena starts working for the mysterious Professor Whitlock, she finds him endlessly alluring, despite his fangs. While creating this series, we sought to answer the age-old question: What makes vampires sexy?\n\nLISTEN NOW\nDipsea Takes its Place on the TED Main Stage\n\nOur co-founder Gina’s TED Talk is live! Hear her talk about the power of imagination, audio, and the importance of taking pleasure into your own hands.\n\nWATCH NOW\nE.R. Fightmaster Brings a Queer Love Story to Life\n\nE.R. Fightmaster, the unassumingly sexy and totally disarming actor from Grey’s Anatomy and Hulu’s Shrill, stars as Jay in our newest series ‘Plus One.’ Fightmaster was also a co-producer, and their story is an homage to the playful intimacy of queer relationships–this time, at a gay wedding. “I really love weddings,” says E.R., but “to go with a stranger and not know anyone and just witness all this raw love? It’s very kinky to me.”\n\nDISCOVER OUR COLLAB\nLuke Cook Brings His Aussie Charm to Dipsea\n\nLuke Cook, from Netflix’s Chilling Adventures of Sabrina, is the star of our new series “Act Natural.” He’s everything we want: a little bit of mischief, a lot of sweetness, and a deep Australian accent that’ll make anyone weak in the knees. As start and co-producer, his passion and creativity inspired much of the way his character navigates the Hollywood machine in a subversive, sexy way—without ever losing the optimism that you can really have it all.\n\nDISCOVER OUR COLLAB\nSleep by Dipsea\n\nA good night’s sleep is the best happy ending. Sleep Overs offer the same sense of cozy as hearing a loved one gently pad around in the next room, Bedtime Stories have just enough plot to let your mind meander, and Soundscapes are soothing and familiar sounds to lull you into dreamland.\n\nEXPLORE SLEEP\nExtra, extra.\n\n"A genre of its own, with audio details that enhance a sense of pleasure, safety, and calm."\n\n"Where sexual wellness and desire meet storytelling."\n\n"For women who aren’t sure what turns them on just yet, I can see Dipsea being a breath of fresh air."\n\n"It’s Audible for orgasms or a Masterclass in masturbation, with an interface so pleasing Glossier is probably jealous."\n\n"Consent and sex-positivity are written into the DNA."\n\n"The characters feel like they have depth, emotion, and a full narrative arc."\n\nListen, light yourself up.\n\nOr listen to Dipsea on any browser.\n\nABOUT US\n\nREACH US\n\nACCOUNT\n\nSUPPORT\n\nTRY FOR FREE\nPrivacy PolicyTerms & Conditions\n\n© 2023 Dipsea Inc. All Rights Reserved',
  metaTitle: 'Dipsea | Short and Sexy Audio Stories',
  metaDescription:
    'Where sexual wellness meets storytelling. Sexy audio stories and intimate wellness sessions to help you find joy and confidence in and out of the bedroom.',
};

// TODO: Have the onboarding be a transaction
async function onboardNewPage(req: Request, res: Response): Promise<void> {
  const { website_url } = req.body;
  const project = await findOrCreateProject(website_url);
  const browserSession = await initiatePage(website_url);
  const mainElements = await scrapMainElements(website_url, browserSession);

  const context = await getPageContext(website_url, browserSession);

  const journey = await db.Journey.create({
    name: 'Journey for ' + project.name,
    page: website_url, // Maybe store just the path instead
    project_id: project.id,
    context,
  });

  const createdElements = await createElements(
    Object.entries(mainElements).map((element) => ({
      domReference: element[1][0],
      selector: element[1][1],
      type: element[0],
      style: element[1][2],
    })),
    journey.id,
  );

  await createExperiments(createdElements, journey);
  browserSession.browser.close();
  res.status(200).send(project);
}

export default onboardNewPage;
