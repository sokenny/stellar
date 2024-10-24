import styles from './page.module.css';

import EnterUrlForm from '../components/EnterUrlForm/EnterUrlForm';

export default async function OnboardStartPage({ params, searchParams }) {
  // If search params dont have'juanito=banana' return "not authorized"
  if (searchParams.juanito !== 'banana') {
    return <div>not authorized</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Enter URL to scrap and onboard</h1>
      <EnterUrlForm />
    </div>
  );
}
