'use client';

import { signIn } from 'next-auth/react';
import Button from '../Button';
import styles from './HomeActions.module.css';

const HomeActions = () => {
  return (
    <Button
      className={styles.button}
      type="submit"
      onClick={() => {
        window?.gtag?.('event', 'click_sign_up', {
          location: 'home',
        });
        signIn('google', {
          callbackUrl: '/dashboard',
        });
      }}
    >
      Go Stellar
    </Button>
  );
};

export default HomeActions;
