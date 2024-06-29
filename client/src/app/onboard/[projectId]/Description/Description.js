'use client';

import styles from './Description.module.css';

const Description = () => {
  return (
    <div className={styles.Description}>
      <p>
        Here are some experiments generated from your main elements. We estimate
        a potential <span>34% increase in your page's conversion rate</span>{' '}
        solely from these copy tweaks.
      </p>
      <p>
        You can further edit these variants after creating an account at the end
        of this step.
      </p>
    </div>
  );
};

export default Description;
