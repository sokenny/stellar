import Image from 'next/image';
import SignUpCTA from './components/SignUpCTA';
import Bolt from './icons/Bolt';
import Traffic from './icons/Traffic';
import Goal from './icons/Goal';
import Cookie from './icons/Cookie';
import styles from './page.module.css';

export default async function HomePage({}) {
  return (
    <div className={styles.HomePage}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            The #1 <span className={styles.varA}>A</span>/
            <span className={styles.varB}>B</span> test solution for marketing
            teams
          </h1>
          <h2 className={styles.description}>
            Your real alternative to <b>Google Optimize</b>. No coding required.
            86% of our users increase their conversion rates under 1 month, for
            free.
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
                <Goal color="white" width={15} height={15} />
              </div>
              <div className={styles.text}>
                Ease of use. Clutter-free. To the point.
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
              <img
                src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-visual-editor.webp"
                alt="Create variants"
                width={550}
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
              <img
                src="https://stellar-app-bucket.s3.us-east-2.amazonaws.com/assets/stellar-goal-setting.webp"
                alt="Set your goal"
                width={550}
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
        <div className={styles.pricing}>
          <h3>Pricing</h3>
          <p>
            Our software is available for <b>free</b>. No credit card required.
            After getting set-up, if you exceed 10k MTU (monthly tracked users),
            we will reach out to establish a <b>$32 USD monthly</b>{' '}
            subscription.
          </p>
          <SignUpCTA className={styles.pricingCTA}>Start For Free</SignUpCTA>
        </div>
        <div className={styles.faqs}>
          {/* <h3>FAQ</h3> */}
          {/* <Faqs /> */}
        </div>
      </div>
    </div>
  );
}
