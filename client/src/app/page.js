import EnterUrlForm from './components/EnterUrlForm/EnterUrlForm';
import styles from './page.module.css';

// TODO: Create onboarding page
export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1 className={styles.h1}>Enter page url</h1>
        <EnterUrlForm />
      </div>
    </main>
  );
}