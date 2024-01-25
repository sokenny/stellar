import LoginForm from '../components/LoginForm/LoginForm';
import styles from './page.module.css';

export default function Login() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1 className={styles.h1}>Login</h1>
        <LoginForm />
      </div>
    </main>
  );
}
