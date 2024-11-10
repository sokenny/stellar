'use client';

import React from 'react';
import Button from '../../../components/Button/Button';
import Link from 'next/link';
import styles from './CTA.module.css';

const CTA = () => {
  return (
    <div className={styles.cta}>
      <h2>Try Our A/B Testing Tool for Free!</h2>
      <p>
        No credit card required. Start testing in minutes with our easy-to-use
        platform.
      </p>
      <Link href="/">
        <Button className={styles.ctaButton}>Get Started</Button>
      </Link>
    </div>
  );
};

export default CTA;
