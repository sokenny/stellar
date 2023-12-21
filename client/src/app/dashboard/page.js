import styles from './page.module.css';

// TODO: Design journey concept page on figma
export default async function Dashboard({ params }) {
  //   const joruneyId = params.id;
  //   const res = await fetch(`http://localhost:3001/api/journey/${joruneyId}`, {
  //     // cache: 'force-cache',
  //     cache: 'no-store',
  //   });

  //   const journey = await res.json();

  return (
    <div className={styles.Dashboard}>
      <h1>Dashboard!</h1>
    </div>
  );
}
