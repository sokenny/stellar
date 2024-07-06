import EnterUrlForm from './components/EnterUrlForm/EnterUrlForm';
import styles from './page.module.css';

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
            Get AI generated experiments for your landing pages. Increase
            conversions, effortlessly.
          </h2>
        </div>
        <div className={styles.form}>
          <EnterUrlForm />
        </div>
        <div className={styles.bullets}>
          <div className={styles.bullet}>
            <span>1.</span> Get AI generated experiments
          </div>
          <div className={styles.bullet}>
            <span>2.</span> Edit them if needed
          </div>
          <div className={styles.bullet}>
            <span>3.</span> Launch within seconds
          </div>
        </div>
        <div className={styles.loomContainer}>
          <div className={styles.infoBar}>2 minute demo :)</div>
          <iframe
            src="https://www.loom.com/embed/6d28049798834e6f8b77db8d1dc51f25?sid=7d18fb2e-0f83-4b14-8928-29592f8471eb"
            frameborder="0"
            webkitallowfullscreen
            mozallowfullscreen
            allowfullscreen
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
