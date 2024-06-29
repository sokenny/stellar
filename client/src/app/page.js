import EnterUrlForm from './components/EnterUrlForm/EnterUrlForm';
import styles from './page.module.css';

export default async function HomePage({}) {
  return (
    <div className={styles.HomePage}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Stellar</h1>
          <h2 className={styles.description}>Your AB tests on autopilot</h2>
        </div>
        <div className={styles.form}>
          <EnterUrlForm />
        </div>
        {/* TODO-p1-1: Create attractive / descriptive landing page */}
        <div className={styles.bullets}>
          <div>1. Get ai generated experiments</div>
          <div>2. Edit them if needed</div>
          <div>3. Launch within seconds</div>
        </div>
      </div>
    </div>
  );
}
