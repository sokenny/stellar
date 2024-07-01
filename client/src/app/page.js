import EnterUrlForm from './components/EnterUrlForm/EnterUrlForm';
import Faqs from './components/Faqs';
import styles from './page.module.css';

// TODO-p1-1: Add redis for client exp fetching and measure performance diff

export default async function HomePage({}) {
  return (
    <div className={styles.HomePage}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your A/B tests on autopilot</h1>
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
        {/* TODO-p1-2: Planear y grabar demo */}
        {/* 1: Brief explanation of what the software is about */}
        {/* 2: Input URL and show experiments created */}
        {/* 3: Create account and setup snippet */}
        {/* 4: Show how to edit variants */}
        {/* 5: Set up goal and launch experiment */}
        {/* 6: Display the experiment in action and how data is updated on the table */}

        <div className={styles.loomContainer}>
          <div className={styles.infoBar}>1 minute demo :)</div>
          <div>
            <iframe
              src="https://www.loom.com/embed/adc6f34bf1fe4ce3ac849396cb4d7734?sid=28444408-debd-4eba-97c1-d09a05c255ae"
              frameBorder="0"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allowFullScreen
            ></iframe>
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
