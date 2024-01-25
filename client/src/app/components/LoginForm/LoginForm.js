'use client';

import { signIn } from 'next-auth/react';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  return (
    <div className={styles.container}>
      <div
        className={styles.googleSignIn}
        onClick={() =>
          signIn('google', {
            callbackUrl: `/dashboard`,
          })
        }
      >
        Continue With Google
      </div>
    </div>
  );
};

export default LoginForm;
