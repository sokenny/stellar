import styles from './page.module.css';

export default async function OnboardStartPage({ params, searchParams }) {
  return (
    <div className={styles.container}>
      <script async src="https://tally.so/widgets/embed.js"></script>

      <iframe
        data-tally-src="https://tally.so/r/w4NyJo?transparentBackground=1"
        width="100%"
        height="100%"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        title="Stellar Onboarding"
      ></iframe>
    </div>
  );
}
