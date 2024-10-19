import SignUpCTA from './components/SignUpCTA';
import AutoPlayVideo from './components/AutoPlayVideo';
import Bolt from './icons/Bolt';
import Traffic from './icons/Traffic';
import Goal from './icons/Goal';
import Check from './icons/Check';
import Cookie from './icons/Cookie';
import styles from './page.module.css';
import { Button } from '@nextui-org/react';

const quotes = [
  {
    quote: 'A/B testing that didn’t make my head hurt.',
    color: '#0072f5',
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
    quote: 'It’s powerful, but it doesn’t overcomplicate things.',
    color: '#00ba2f',
  },
  {
    quote: 'It’s super reliable—no headaches or hidden fees.',
    color: '#8300e0',
  },
  {
    quote: 'I got clear results without any confusion or overload.',
    color: '#D52941',
  },
  {
    quote:
      'Clear data, real insights—without the usual over-complicated dashboards.',
    color: '#00b7f5',
  },
  {
    quote: 'Exactly what my marketing team needed. AB testing without the BS.',
    color: '#FF92C2',
  },
];

export default async function HomePage({}) {
  return (
    <div className={styles.HomePage}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            The preferred <span className={styles.varA}>A</span>/
            <span className={styles.varB}>B</span> test solution for marketing
            teams
          </h1>
          <h2 className={styles.description}>
            Your real alternative to <b>Google Optimize</b>. Clutter free and to
            the point. 86% of our users increase their conversion rates under 1
            month, for free.
          </h2>
        </div>
        <div>
          <SignUpCTA>Go Stellar</SignUpCTA>
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
        <div className={styles.process}>
          <div className={styles.block}>
            <div className={styles.left}>
              <AutoPlayVideo
                src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/visual-editor.mp4"
                poster="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-visual-editor.webp"
                width={550}
                className={styles.video}
              />
            </div>
            <div className={styles.texts}>
              <h3 className={styles.title}>
                <span>Create variants</span> with our visual editor.
              </h3>
              <p>
                Once you install our snippet, you'll be able to access a WYSIWYG
                editor inside of your website. Here you can easily make the
                necessary HTML / CSS adjustments to create your variants.
              </p>
            </div>
          </div>
          <div className={styles.block}>
            <div className={`${styles.left} ${styles.texts}`}>
              <h3 className={styles.title}>
                <span>Set your goal</span> in seconds.
              </h3>
              <p>
                Our goal setting is easy yet powerful. Set one based on clicks,
                page visits or time spent on the page. Zero coding required.
              </p>
            </div>
            <div>
              <AutoPlayVideo
                src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/set-goal.mp4"
                poster="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-goal-setting.webp"
                width={550}
                className={styles.video}
              />
            </div>
          </div>
          <div className={styles.block}>
            <div className={styles.left}>
              <img
                src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-experiment-page.webp"
                alt="Control your experiment"
                width={550}
              />
            </div>
            <div className={styles.texts}>
              <h3 className={styles.title}>
                <span>Control your experiments</span> and track their
                performance.
              </h3>
              <p>
                Stay on top of your experiment's progress. Pause and resumen if
                needed. Track your conversion rates and see how your variants
                are performing.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.advantages} ${styles.quote}`}>
          {/* <img src="/3d-ball.png" width={400} height={400} /> */}
          <h3>
            Split test your way to market fit. 86% of our users see a boost in
            conversion rates within a month—completely free.
          </h3>
        </div>
        {/* agregar borders de colores */}
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
        <div className={styles.pricing}>
          <h3>Pricing</h3>
          <div className={styles.plans}>
            <div className={styles.plan}>
              <h4>Starter</h4>
              <div className={styles.price}>
                <span>$0</span> USD/mo.
              </div>
              <div className={styles.payment}>paid annually</div>
              <Button className={styles.planButton}>Get Started</Button>
              <p>
                <Check width={12} /> Up to 10k MTU
              </p>
              <p>
                <Check width={12} /> Basic support
              </p>
            </div>
            <div className={`${styles.plan} ${styles.growth}`}>
              <h4>Growth</h4>
              <div className={styles.price}>
                <span>$29</span> USD/mo.
              </div>
              <div className={styles.payment}>paid annually</div>
              <Button className={styles.planButton} color="primary">
                Get Started
              </Button>
              <p>
                <Check width={12} /> Up to 50k MTU
              </p>
              <p>
                <Check width={12} /> Priority support
              </p>
            </div>
            <div className={styles.plan}>
              <h4>Enterprise</h4>
              <div className={styles.price}>
                <span>$89</span> USD/mo.
              </div>
              <div className={styles.payment}>paid annually</div>
              <Button className={styles.planButton}>Get Started</Button>
              <p>
                <Check width={12} /> Up to 250k MTU
              </p>
              <p>
                <Check width={12} /> Priority support
              </p>
            </div>
          </div>
          <div className={styles.bigger}>
            For bigger plans, please reach out at hello@gostellar.app
          </div>
        </div>
        <div className={styles.faqs}>
          {/* <h3>FAQ</h3> */}
          {/* <Faqs /> */}
        </div>
      </div>
    </div>
  );
}
