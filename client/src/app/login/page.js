import LoginForm from '../components/LoginForm/LoginForm';
import styles from './page.module.css';

const LoginPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stellar Log In</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
