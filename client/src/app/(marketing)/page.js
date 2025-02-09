import SignUpCTA from '../components/SignUpCTA';
import AutoPlayVideo from '../components/AutoPlayVideo';
import Plans from '../components/Plans';
import Link from 'next/link';
import StellarSpeed from '../components/StellarSpeed';
import Bolt from '../icons/Bolt';
import Traffic from '../icons/Traffic';
import Goal from '../icons/Goal';
import Cookie from '../icons/Cookie';
import { Button } from '@nextui-org/react';
import styles from './page.module.css';

export const quotes = [
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
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
!function(){var e="body {opacity: 0 !important;}",t=document.createElement("style");t.type="text/css",t.id="page-hide-style",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.head.appendChild(t),window.rmo=function(){var e=document.getElementById("page-hide-style");e&&(e.parentNode.removeChild(e),document.body.style.opacity="")},setTimeout(window.rmo,2e3)}();
            `,
        }}
      />
      <link rel="preconnect" href="https://d3niuqph2rteir.cloudfront.net" />
      <link rel="dns-prefetch" href="https://d3niuqph2rteir.cloudfront.net" />
      <script
        async
        src="https://d3niuqph2rteir.cloudfront.net/client_js/stellar.js?apiKey=0731c4ad35896011b5a57edd84c2a6da:2ed5c336eaab747c6cb462aa39840a6db9b5abc7dfc750b89103abacb98873f4"
      ></script>

      <div className={styles.HomePage}>
        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.header}>
              <h1 className={styles.title}>A/B test any website</h1>
              <h2 className={styles.description}>
                Built for speed and simplicity. A streamlined alternative to
                complex testing tools.
              </h2>
            </div>
            <div className={styles.ctaSection} id="cta-section">
              <div className={styles.buttons}>
                <a
                  href="https://calendly.com/juan-gostellar/30min"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <SignUpCTA className={styles.goStellarBtn}>
                    Start For Free
                  </SignUpCTA>
                  <Button
                    className={styles.bookDemoBtn}
                    color="primary"
                    variant="bordered"
                  >
                    Book a Demo
                  </Button>
                </a>
              </div>
              <div className={styles.points}>
                <div className={styles.noCard}>💳 No credit card required</div>
                <div className={styles.lightest}>
                  ⚡️ Lightest in the market at 5.4kb
                </div>
              </div>
              <Link href="#testimonials">
                <div className={styles.lovedBy} id="loved-by">
                  <div className={styles.faces}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((face, index) => {
                      return (
                        <div key={index} className={styles.face}>
                          <img
                            src={`https://d3niuqph2rteir.cloudfront.net/assets/test${face}.webp`}
                            alt="face"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <h3>🚀 Loved by CRO marketers</h3>
                </div>
              </Link>
            </div>
          </section>
          <section className={styles.section}>
            <div className={styles.favoriteTools}>
              <h3>Works with your favorite tools</h3>
              <div className={styles.tools}>
                {[
                  'shopify',
                  'webflow',
                  'ga',
                  'woocommerce',
                  'wordpress',
                  'wix',
                ].map((tool, index) => {
                  return (
                    <div
                      key={tool}
                      className={`${styles.tool} ${styles[tool]}`}
                    >
                      <img
                        src={`https://d3niuqph2rteir.cloudfront.net/assets/tools/stool-${tool}.png`}
                        alt={tool}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          <div className={styles.sixtySecLaunch}>
            <h3>Launch with us in &lt;60 seconds</h3>
            <AutoPlayVideo
              src="https://d3niuqph2rteir.cloudfront.net/assets/60seclaunch3.mp4"
              className={styles.video}
              showProgress={true}
              animate={true}
            />
          </div>

          <section className={styles.section}>
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
                    Free forever, under 25k monthly users.
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
          </section>

          {/* <HomeChartSection /> */}
          <section className={styles.section}>
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
                      src="https://d3niuqph2rteir.cloudfront.net/assets/ai-editor-4.mp4"
                      poster="https://d3niuqph2rteir.cloudfront.net/assets/stellar-visual-editor.webp"
                      width={'100%'}
                      className={styles.video}
                      // showProgress={true}
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
                      Add custom JavaScript and CSS for more granular control
                      over your page. Perfect for advanced tweaks and precise
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
                  </div>
                  <div>
                    <AutoPlayVideo
                      src="https://d3niuqph2rteir.cloudfront.net/assets/goal-setting-2.mp4"
                      poster="https://d3niuqph2rteir.cloudfront.net/assets/stellar-goal-setting.webp"
                      width={'100%'}
                      className={styles.video}
                      // showProgress={true}
                    />
                  </div>
                </div>
              </div>
              {/* add realtime reporting section that talks about GA4 */}
            </div>
          </section>
          <section className={styles.section}>
            <div className={styles.speedContainer}>
              <h3>Fastest in the market, built for speed and simplicity</h3>
              <StellarSpeed />
            </div>
          </section>
          <section className={`${styles.section} ${styles.ytContainer}`}>
            <div className={styles.loomContainer} id="loom-demo-1">
              <div className={styles.infoBar}>watch our quick demo :)</div>

              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/dpDv5s4CZGA?si=cyF0jI97yfNdFI5b"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </section>
          <section className={styles.section}>
            <div className={`${styles.advantages} ${styles.quote}`}>
              <h3>Split test your way to market fit and beyond</h3>
              <SignUpCTA className={styles.startFreeBtn}>
                Start For Free
              </SignUpCTA>
            </div>
          </section>
          <section className={styles.section} id="testimonials">
            <div className={styles.biteTestimonials}>
              <h3>Why do users prefer Stellar?</h3>

              <div className={styles.testimonials}>
                <div
                  className={styles.testimonial}
                  style={{
                    borderColor: quotes[5].color,
                  }}
                >
                  <div className={styles.testimonialHeader}>
                    <div
                      className={styles.avPic}
                      style={{
                        backgroundImage: `url(https://d3niuqph2rteir.cloudfront.net/assets/test7.webp)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div>
                      <p className={styles.name}>
                        <strong>Maria P. — Digital Marketing Director</strong>
                      </p>
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  </div>

                  <p className={styles.quote}>
                    "Stellar is a breath of fresh air. It's clutter-free and
                    does exactly what you need without the unnecessary features.
                    The script is small and doesn't slow down our site, which
                    was a big concern for us. The support team is responsive and
                    knowledgeable. We've already recommended Stellar to other
                    teams."
                  </p>
                </div>
                <div
                  className={styles.testimonial}
                  style={{
                    borderColor: quotes[0].color,
                  }}
                >
                  <div className={styles.testimonialHeader}>
                    <div
                      className={styles.avPic}
                      style={{
                        backgroundImage: `url(https://d3niuqph2rteir.cloudfront.net/assets/test1.webp)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div>
                      <p className={styles.name}>
                        <strong>Anna R. — CRO Specialist</strong>
                      </p>
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  </div>
                  <p className={styles.quote}>
                    "Stellar is exactly what we needed. We switched from other
                    testing tools because they were too complex and costly. With
                    Stellar we ran our first test in under 10 minutes, no
                    developer required. Our landing's visitor-to-signup rate
                    increased by about 30% in just a few weeks. It’s fast,
                    lightweight, and the support team is amazing."
                  </p>
                </div>
                <div
                  className={styles.testimonial}
                  style={{
                    borderColor: quotes[1].color,
                  }}
                >
                  <div className={styles.testimonialHeader}>
                    <div
                      className={styles.avPic}
                      style={{
                        backgroundImage: `url(https://d3niuqph2rteir.cloudfront.net/assets/test3.webp)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div>
                      <p className={styles.name}>
                        <strong>David L. — Growth Marketer</strong>
                      </p>
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  </div>

                  <p className={styles.quote}>
                    "I've tried VWO and Optimizely, but Stellar stands out for
                    its ease of use and simplicity. The script is super
                    lightweight, and there's no impact on our site speed.
                    Setting up tests was quick, and the visual editor made it
                    easy to adjust our pages without any coding. It's been a
                    game-changer for our marketing team."
                  </p>
                </div>
                <div
                  className={styles.testimonial}
                  style={{
                    borderColor: quotes[2].color,
                  }}
                >
                  <div className={styles.testimonialHeader}>
                    <div
                      className={styles.avPic}
                      style={{
                        backgroundImage: `url(https://d3niuqph2rteir.cloudfront.net/assets/test2.webp)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div>
                      <p className={styles.name}>
                        <strong>Sarah M. — E-commerce Owner</strong>
                      </p>
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  </div>

                  <p className={styles.quote}>
                    "We needed a Google Optimize replacement, and Stellar
                    exceeded our expectations. The tool is intuitive, and the
                    onboarding was seamless. The reporting is clear aside from
                    the fact that they integrate well with GA4. Highly recommend
                    for anyone serious about improving their website
                    performance."
                  </p>
                </div>
                <div
                  className={styles.testimonial}
                  style={{
                    borderColor: quotes[3].color,
                  }}
                >
                  <div className={styles.testimonialHeader}>
                    <div
                      className={styles.avPic}
                      style={{
                        backgroundImage: `url(https://d3niuqph2rteir.cloudfront.net/assets/test4.webp)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div>
                      <p className={styles.name}>
                        <strong>Alex T. — Product Manager</strong>
                      </p>
                      <p>⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  </div>

                  <p className={styles.quote}>
                    "Stellar is the best A/B testing platform I've used. It's
                    lightweight, fast, and integrates perfectly with our
                    existing setup. The visual editor is fantastic—our team was
                    able to create and launch experiments without any dev
                    assistance. We saw a 25% uplift in our signup conversion
                    rate within weeks. Great tool!"
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.section}>
            <Plans />
          </section>
          <section className={styles.section}>
            <div className={styles.notSure}>
              <h3>
                Still not sure? <span>Let's talk</span>
              </h3>
              <a
                href="https://calendly.com/juan-gostellar/30min"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Button className={styles.scheduleBtn}>Book a Demo</Button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
