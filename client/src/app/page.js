import SignUpCTA from './components/SignUpCTA';
import AutoPlayVideo from './components/AutoPlayVideo';
import Plans from './components/Plans';
import GridBg from './components/GridBg/GridBg';
import HomeChartSection from './components/HomeChartSection';
import StellarSpeed from './components/StellarSpeed';
import Bolt from './icons/Bolt';
import Traffic from './icons/Traffic';
import Goal from './icons/Goal';
import Cookie from './icons/Cookie';
import { Button } from '@nextui-org/react';
import styles from './page.module.css';

const quotes = [
  {
    quote: 'Exactly what my marketing team needed. AB testing without the BS.',
    color: '#FF92C2',
  },
  {
    quote:
      'Clear data, real insights—without the usual over-complicated dashboards.',
    color: '#00b7f5',
  },
  {
    quote: 'This tool helped me actually figure out market fit.',
    color: '#cb5edc',
  },
  {
    quote:
      'Went from almost no conversions to real sales, in a bit over 3 weeks.',
    color: '#f5a623',
  },
  {
    quote: 'Stellar beat out VWO and AB Tasty—way easier and more affordable.',
    color: '#00b7f5',
  },
  {
    quote: 'Super lightweight script, no performance hit, and fast test loads.',
    color: '#00ba2f',
  },
  {
    quote: 'We switched from other platforms—Stellar is simpler and cheaper.',
    color: '#8300e0',
  },
  {
    quote: 'I set up my first test in 5 minutes, no dev needed.',
    color: '#00b7f5',
  },
];

export default async function HomePage({}) {
  return (
    <>
      {/* <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
!function(){var e="body {opacity: 0 !important;}",t=document.createElement("style");t.type="text/css",t.id="page-hide-style",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),window.rmo=function(){var e=document.getElementById("page-hide-style");e&&(e.parentNode.removeChild(e),document.body.style.opacity="")},setTimeout(window.rmo,2e3)}();
            `,
        }}
      /> */}
      <link rel="preconnect" href="https://d3niuqph2rteir.cloudfront.net" />
      <link rel="dns-prefetch" href="https://d3niuqph2rteir.cloudfront.net" />
      <script
        async
        src="https://d3niuqph2rteir.cloudfront.net/client_js/stellar.js?apiKey=0731c4ad35896011b5a57edd84c2a6da:2ed5c336eaab747c6cb462aa39840a6db9b5abc7dfc750b89103abacb98873f4"
      ></script>

      <div className={styles.HomePage}>
        <div className={styles.content}>
          <div className={styles.header}>
            <GridBg
              style={{
                position: 'absolute',
                opacity: 0.2,
                transform: 'translateY(-50px)',
                width: '1200px',
                height: '800px',
                zIndex: 0,
              }}
            />
            <h1 className={styles.title}>
              <span className={styles.varA}>A</span>/
              <span className={styles.varB}>B</span> test any website.
            </h1>
            <h2 className={styles.description}>
              Your real alternative to <b>Google Optimize</b>. Clutter free and
              to the point. The preferred choice among CRO marketers.
            </h2>
          </div>
          <div className={styles.ctaSection}>
            <div className={styles.buttons}>
              <SignUpCTA className={styles.goStellarBtn}>
                Start For Free
              </SignUpCTA>
              {/* <Button
                className={styles.scheduleDemoBtn}
                color="secondary"
                variant="flat"
              >
                Schedule demo
              </Button> */}
            </div>
            <div className={styles.points}>
              <div className={styles.noCard}>💳 No credit card required</div>
              <div className={styles.lightest}>
                ⚡️ Lightest in the market at 7.5kb
              </div>
            </div>
          </div>

          <div className={styles.loomContainer}>
            <div className={styles.infoBar}>2 minute demo :)</div>
            <iframe
              // src="https://www.loom.com/embed/6d28049798834e6f8b77db8d1dc51f25?sid=7d18fb2e-0f83-4b14-8928-29592f8471eb"
              src="https://www.loom.com/embed/e7e907a9f30746c192d09a07d72b8d3b?sid=cd48b15a-4941-47c5-b9a9-52d1bb020bdc"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <HomeChartSection />
          {/* <CoolLinesSVG /> */}
          <div className={styles.advantages}>
            <h3>Advantages of Stellar</h3>
            <div className={styles.list}>
              <div className={styles.advantage}>
                <div className={styles.icon}>
                  <Goal color="white" width={15} height={15} />
                </div>
                <div className={styles.text}>
                  Ease of use. Clutter-free. To the point.
                </div>
              </div>
              <div className={styles.advantage}>
                <div className={styles.icon}>
                  <Bolt color="white" width={15} height={15} />
                </div>
                <div className={styles.text}>
                  Lightning-fast load time thanks to CDN caching.
                </div>
              </div>
              <div className={styles.advantage}>
                <div className={styles.icon}>
                  <Traffic color="white" width={15} height={15} />
                </div>
                <div className={styles.text}>
                  Unlimitted traffic, experiments and variations.
                </div>
              </div>
              <div className={styles.advantage}>
                <div className={styles.icon}>
                  <Cookie color="white" width={15} height={15} />
                </div>
                <div className={styles.text}>No use of cookies.</div>
              </div>
            </div>
          </div>
          {/* <HomeChartSection /> */}
          <div className={styles.process}>
            <div className={styles.row}>
              <div className={styles.block}>
                <div className={styles.texts}>
                  <h3 className={styles.title}>
                    Create variants with our visual editor
                  </h3>
                </div>
                <div>
                  <AutoPlayVideo
                    src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/visual-editor.mp4"
                    poster="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-visual-editor.webp"
                    width={'100%'}
                    className={styles.video}
                  />
                </div>
              </div>
              <div className={styles.multiBlock}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>No-code visual editor</h3>
                  <p>
                    Install our snippet to access a WYSIWYG editor directly on
                    your site. Works with any website.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    Dynamic Keyword Insertion
                  </h3>
                  <p>
                    Personalize your landing pages copy with dynamic keyword
                    insertion. Great for PPC campaigns. Zero coding required.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Custom JS and CSS</h3>
                  <p>
                    Add custom JavaScript and CSS for more granular control over
                    your page. Perfect for advanced tweaks and precise
                    adjustments.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.multiBlock}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Easy Goal Setup</h3>
                  <p>
                    Set your goals in seconds with a simple interface. Choose
                    from page visits, time spent on a page, or specific user
                    actions—no coding needed.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Advanced Goal Tracking</h3>
                  <p>
                    Track custom user events like button clicks, form
                    submissions, or video plays. Combine multiple goals for a
                    more comprehensive view of performance.
                  </p>
                </div>
              </div>
              <div className={styles.block}>
                <div className={`${styles.left} ${styles.texts}`}>
                  <h3 className={styles.title}>Set your goal in seconds.</h3>
                  <p>
                    Our goal setting is easy yet powerful. Set one based on
                    clicks, page visits or time spent on the page. Zero coding
                    required.
                  </p>
                </div>
                <div>
                  <AutoPlayVideo
                    src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/set-goal.mp4"
                    poster="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-goal-setting.webp"
                    width={'100%'}
                    className={styles.video}
                  />
                </div>
              </div>
            </div>
            {/* <div className={styles.block}>
              <div className={styles.texts}>
                <h3 className={styles.title}>
                  Control your experiments and track their performance.
                </h3>
                <p>
                  Stay on top of your experiment's progress. Pause and resumen
                  if needed. Track your conversion rates and see how your
                  variants are performing.
                </p>
              </div>
              <div>
                <img
                  src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-experiment-page.webp"
                  alt="Control your experiment"
                  width={'100%'}
                />
              </div>
            </div> */}
          </div>
          <div className={`${styles.advantages} ${styles.quote}`}>
            <h3>Split test your way to market fit and beyond</h3>
            <SignUpCTA className={styles.startFreeBtn}>
              Start For Free
            </SignUpCTA>
          </div>
          <div className={styles.speedContainer}>
            <h3>Fastest in the market, built for speed and simplicity</h3>
            <StellarSpeed />
          </div>
          <div className={styles.biteTestimonials}>
            <h3>Why do users prefer Stellar?</h3>
            <div className={styles.bitesContainer}>
              {quotes.map((q, i) => (
                <div
                  className={styles.bite}
                  key={i}
                  style={{
                    borderColor: q.color,
                    backgroundColor: `${q.color}11`,
                  }}
                >
                  <div
                    className={styles.avPic}
                    style={{
                      backgroundImage: `url(https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/test${
                        i + 1
                      }.webp)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  ></div>
                  <div className={styles.quote}>"{q.quote}"</div>
                </div>
              ))}
            </div>
          </div>
          <Plans />
          <div className={styles.notSure}>
            <h3>
              Still not sure? <span>Let's talk</span>
            </h3>
            <a
              href="https://calendly.com/juanchaher99/stellar-demo"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button className={styles.scheduleBtn}>Schedule a Demo</Button>
            </a>
            {/* <div className={styles.cardContainer}>
              <div className={styles.bgDeco}></div>
              <div className={styles.card}>
                <Button>Schedule a Demo</Button>
              </div>
            </div> */}
          </div>
          {/* <div className={styles.faqs}> */}
          {/* <h3>FAQ</h3> */}
          {/* <Faqs /> */}
          {/* </div> */}
        </div>
      </div>
    </>
  );
}
