import SignUpForm from '../components/SignUpForm';
import styles from './page.module.css';

const SignUpPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stellar Sign Up</h1>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
