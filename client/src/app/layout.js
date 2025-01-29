import { Poppins } from 'next/font/google';
import { Providers } from './providers';
import Nav from './components/Nav/Nav';
import './globals.css';
import getAuthTokenName from './helpers/getAuthTokenName';
import { cookies, headers } from 'next/headers';
import styles from './layout.module.css';
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';

import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
});

export const metadata = {
  title: 'Stellar | A/B Test Any Website',
  description: 'Fastes on the market | Loved by CRO marketers',
};
// IDEAS:
// Copiarme de la seccion de AB Testing de optimonk
// https://supademo.com/?utm_source=My%20workspace&utm_medium=powered-by_web&utm_campaign=powered-by_web

// triggerrebuild

// Rough estimate of events processed per monthL: Per day we can do 172,800 with 1 worker. LEts cut out 20% of that to be conservative, so 138,240. PEr month that is 4,147,200.

// TODO-p1-1: Launch on https://betalist.com/submissions/new - producthunt - appsumo
// TODO-p1-1: https://reel.farm/#pricing
// TODO-p1-1: Add ai prompting for html edits
// TODO-p1-1: Record "how to get unique selector" And embed in editor
// TODO-p1-1: Set a max goals to track per experiment
// TODO-p1-1: Have a "save big with Stellar" like croct https://croct.com/pricing
// TODO-p1-1: Add faws
// TODO-p1-1: Find a place to add crocts ab test criteria recommendations before calling a winner
// TODO-p1-1: Make homepage more clean like Croct's
// TODO-p1-1: Update price
// TODO-p1-1: Copiarle cosas a Croct
// TODO-p1-1: Ab test works w your fav tools right below main header of homepage
// TODO-p1-1: Set email alert to hello@gostellar.app when someone who is not me activates an experiment
// TODO-p1-1: Be able to edit custom js/css from the table
// TODO-p1-1: Create a dashboard
// TODO-p1-1: Create maintenance banner
// TODO-p1-1: Be able to delete goal from the edit modal
// TODO-p1-1: Be able to edit split test var url from the table
// TODO-p1-1: mass email about split url testing
// TODO-p1-1: Create backdoor to flush redis
// TODO-p1-1: Tidy up auto-name generation for experiments
// TODO-p1-1: In edit variant modal, have focus of attention placed in the edited variant fields
// TODO-p1-1: UI for squashed convs
// TODO-p1-1: Hacer un carrousel a lo lemlist pero de Work with your favorite tools: https://www.lemlist.com/es Sacar mas ideas de lemlist
// TODO-p1-1: Have ended experiments come in a separate query
// TODO-p1-1: Refes de https://customer.io/
// TODO-p1-1: Check billing is good across all infra
// TODO-p1-1: Follow up w walter low
// TODO-p1-1: Analizar varybee y copiarme https://www.varybee.com/features - seccion use on any platform
// TODO-p1-1: Launch shopify g ads campaign
// TODO-p1-1: Followup Joe Doveton with my progress
// TODO-p1-1: Be able to filter chart data per dates
// TODO-p1-1: Set up and test queued start trigger
// TODO-p1-1: AB test google button
// TODO-p1-1: Have styles from the editor be appplied w !important
// TODO-p1-1: LEts use a custom fetch instead of interceptFetch since it affects other reqs like segment's
// TODO-p1-1: resume handleGettingStartedCampaign testing carefully / re-check emails make sense
// TODO-p1-1: Be able to filter out sessions between desktop and mobile and perhaps some more cohorts too
// TODO-p1-1: Allow editing global JS and global CSS from the table
// TODO-p1-p1: If G-ads is not working on the weekends, set chedule to pause it those days
// TODO-p1-1: Setup retargeting campaign in g ads w video
// TODO-p1-1: Try out Supa Demo
// TODO-p1-1: Allow reusing goals / implement left sidebar (?)
// TODO/p1-1: swithc to project after creating it
// Que lo de parallel experiments no cuente si url es null
// TODO-p1-1: Allow ai prompting while editing
// TODO-p1-1: Dont allow editing rules after launching
// TODO-p1-1: Allow previewing different urls
// TODO-p1-1: Set up follow up email asking for feedback on lack of activity

// TODO-p1-1: Add Faqs
// TODO-p1-1: A way to fav or flag experiments
// TODO-p1-1: Hacer DKI email mkt send para PPC campaigns
// TODO-p1-1: Research marketing newsletter ads
// TODO-p1-1: Set up a share experiment view
// TODO-p1-1: Add testament that adresses pains and how we solve it. Similar to foundarpal.ai
// TODO-p1-1: copiar cosas de synthesia https://www.synthesia.io/tools/ai-video-editor
// TODO-p1-1: Inspo from https://www.spectaclehq.com/
// TODO-p1-1: Allow setting a description / hypothesis / notes for the experiment

// TECHDEBT:
// TODO-p1-1: Try and have unique-visitors and total-sessions under 1 only service similar to how getchartdata does it
// TODO-p1-1: Use redis cache for stats and chart data.
// TODO-p1-1: Use redis cache for variant preview, to not give impression of slow performant snippet
// TODO-p1-1: Properly set up layouts

// TODO-p1-1: Introduce key error login with prefixes in main services to easily lookup on cloudwatch
// TODO-p1-1: Allow space for variant names
// TODO-p1-1: Add annual / monthly pricing toggle

// TODO-p1-1: Add alerts / notifs for session issues
// TODO-p1-1: Idenfify users w Crisp (?)
// TODO-p1-1: Show extra stats on the experiment page, like avg session time or total clicks or desktop / mobile distribution
// TODO-p2: Copiar https://www.mida.so y armar seccion "Works with your favorite tools". Tambien tomar ideas de su h1 y descri
// TODO-p1-2: Try https://www.blogseo.ai/ for content marketing
// TODO-p1-2: Launch in AppSumo

export default function RootLayout({ children }) {
  const nextCookies = cookies();
  const nextAuthSessionToken = nextCookies.get(getAuthTokenName());
  const headersList = headers();
  const fullUrl = headersList.get('referer') || '';
  const path = fullUrl ? new URL(fullUrl).pathname : '';

  return (
    <html lang="en">
      <head>
        <title>Stellar | A/B Test Any Website</title>
        <meta
          name="description"
          content="A streamlined alternative to complex testing tools. Built for marketers, focused on results."
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-HLTERT31Y6"
        ></Script>
        <Script id="google-ads">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HLTERT31Y6');
          `}
        </Script>
        <Script>
          {`
            window.$crisp=[];window.CRISP_WEBSITE_ID="5db3e7f6-49e2-4948-971b-40019e8f0698";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
          `}
        </Script>
      </head>
      <GoogleTagManager gtmId="GTM-5XVLW5Z9" />
      <body
        className={`${poppins.className} ${styles.layout}
        ${path === '/onboarding' ? styles.onboarding : ''}
      `}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5XVLW5Z9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Providers>
          <Nav token={nextAuthSessionToken?.value} />
          <div>{children}</div>
          <footer className={styles.footer}>hello@gostellar.app</footer>
        </Providers>
      </body>
    </html>
  );
}
