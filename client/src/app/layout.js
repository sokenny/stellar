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

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });

export const metadata = {
  title: 'Stellar | A/B Test Any Website',
  description: 'Loved by Growth Marketers',
};
// IDEAS:
// Copiarme de la seccion de AB Testing de optimonk
// https://supademo.com/?utm_source=My%20workspace&utm_medium=powered-by_web&utm_campaign=powered-by_web

// TODO-p1-1: Run optimizations for g ads campaign
// TODO-p1-1: Introduce key error login with prefixes in main services to easily lookup on cloudwatch
// TODO-p1-1: Copiarme de los transactional emails de mida so
// TODO-p1-1: Upgrades to homepage using optimonk references - Consider Poppins - use this svg https://www.optimonk.com/wp-content/uploads/pp-group-lines.svg
// TODO-p1-1: Add statistical significance display on experiment page
// TODO-p1-1: Copiar la seccion de "Run meaningful A/B tests. Find the..." de optimonk
// TODO-p1-1: Allow space for variant names
// TODO-p1-1: Allow segmenting audience for the experiment, based on country and device (all, mobile, tablet, desktop)
// TODO-p1-1: Consider the buildr working like: if #id, use #id, else, relative selector
// TODO-p1-1: Re-shoot 2 min. demo.
// TODO-p1-1: Properly set up layouts
// TODO-p1-1: Animar con counter y scale up el cartelito de CVR de la winning variant.
// TODO-p1-1: Add annual / monthly pricing toggle
// TODO-p1-1: Copiar https://www.mida.so y armar seccion "Works with your favorite tools". Tambien tomar ideas de su h1 y descri

// TODO-p1-1: Try somethign w google optimize inside the keywords (?)
// TODO-p1-1: Add alerts / notifs for session issues
// TODO-p1-1: Allow setting a description / hypothesis / notes for the experiment
// TODO-p1-1: Idenfify users w Crisp (?)
// TODO-p1-1: Show extra stats on the experiment page, like avg session time or total clicks or desktop / mobile distribution
// TODO-p1-1: Develop AI-assisted experiment creation: Suggests texts, font-colors, sizes, etc.
// TODO-p1-1: Use redis cache for stats and chart data.
// TODO-p1-1: Use redis cache for variant preview, to not give impression of slow performant snippet
// TODO-p1-1: Allow collection of clicks for goal setting
// TODO-p1-1: Create similar blog entries (?) https://www.mida.so/blog
// TODO-p1-1: Crear el loom de "See How" sobre goal setting
// TODO-p1-1: Set up follow up email asking for feedback on lack of activity
// TODO-p1-2: Have a "disabled" state for the snippet. Like a kill-switch JIC
// TODO-p1-2: Try https://www.blogseo.ai/ for content marketing
// TODO-p1-2: Launch in AppSumo
// TODO-p1-2: Create FAQ section (?)

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
          <div className={styles.pageContent}>{children}</div>
          <footer className={styles.footer}>hello@gostellar.app</footer>
        </Providers>
      </body>
    </html>
  );
}
