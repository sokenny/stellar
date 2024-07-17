import HomeActions from './components/HomeActions';
import styles from './page.module.css';

// TODO-p1-1: curate flow without onboarding (straight signup) - more CTAs to instruct user(?) make it dummy proof and unbreakable

export default async function HomePage({}) {
  return (
    <div className={styles.HomePage}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Your <span className={styles.varA}>A</span>/
            <span className={styles.varB}>B</span> tests on autopilot
          </h1>
          <h2 className={styles.description}>
            Easily create and schedule your landing page experiments. No coding
            required. 86% of our users increase their conversion rate under 1
            month.
          </h2>
        </div>
        <div>
          <HomeActions />
        </div>

        <div className={styles.loomContainer}>
          <div className={styles.infoBar}>2 minute demo :)</div>
          <iframe
            src="https://www.loom.com/embed/6d28049798834e6f8b77db8d1dc51f25?sid=7d18fb2e-0f83-4b14-8928-29592f8471eb"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
        <div className={styles.faqs}>
          {/* <h3>FAQ</h3> */}
          {/* <Faqs /> */}
        </div>
      </div>
    </div>
  );
}
