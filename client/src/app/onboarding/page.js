import OnboardingForm from '../components/OnboardingForm';
import styles from './page.module.css';

export default function OnboardStartPage({ params, searchParams }) {
  return (
    <div className={styles.container}>
      <OnboardingForm />
    </div>
  );
}
