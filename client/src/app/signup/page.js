import SignUpForm from '../components/SignUpForm';
import styles from './page.module.css';

const SignUpPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.colLeft}>
        <h1 className={styles.title}>Stellar Sign Up</h1>
        <SignUpForm />
      </div>
      <div className={styles.colRight}>
        <div className={styles.testimonials}>
          <div className={styles.testimonial}>
            <p className={styles.name}>
              <strong>Anna R. — CRO Specialist</strong>
            </p>
            <p>⭐️⭐️⭐️⭐️⭐️</p>
            <p className={styles.quote}>
              "Stellar is exactly what we needed. We switched from other testing
              tools because they were too complex and costly. With Stellar, we
              ran our first test in under 10 minutes, no developer required. Our
              conversions increased by 30% in just a few weeks. It’s fast,
              lightweight, and the support team is amazing."
            </p>
          </div>
          <div className={styles.testimonial}>
            <p className={styles.name}>
              <strong>David L. — Growth Marketer</strong>
            </p>
            <p>⭐️⭐️⭐️⭐️⭐️</p>
            <p className={styles.quote}>
              "I’ve tried VWO and Optimizely, but Stellar stands out for its
              ease of use and simplicity. The script is super lightweight, and
              there’s no impact on our site speed. Setting up tests was quick,
              and the visual editor made it easy to adjust our pages without any
              coding. It’s been a game-changer for our marketing team."
            </p>
          </div>
          <div className={styles.testimonial}>
            <p className={styles.name}>
              <strong>Sarah M. — E-commerce Owner</strong>
            </p>
            <p>⭐️⭐️⭐️⭐️⭐️</p>
            <p className={styles.quote}>
              "We needed a Google Optimize replacement, and Stellar exceeded our
              expectations. The tool is intuitive, and the onboarding was
              seamless. The reporting is clear, and the results helped us
              increase our sales by 20% in the first month. Highly recommend for
              anyone serious about improving their website performance."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
