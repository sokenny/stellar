'use client';

import { Button, Input } from '@nextui-org/react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import segmentTrack from '../../helpers/segment/segmentTrack';
import isInAppBrowser from '../../helpers/isInAppBrowser';
import styles from './LoginForm.module.css';
import Link from 'next/link';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('Email confirmed. You can now log in.');
      hasShownToast.current = true;
    }
  }, []);

  const handleLogin = async () => {
    if (
      !email ||
      !/^(([^<>/().,;:\s@"]+(\.[^<>/().,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email,
      )
    ) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      toast.error(result.error || 'Failed to log in');
    } else {
      toast.success('Logged in successfully');
      window.location.href = '/dashboard';
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      {/* {!isInAppBrowser() && (
        <>
          <Button
            color="primary"
            onPress={() => {
              segmentTrack('click_log_in_google', {
                location: 'page',
              });
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            className={`${styles.button} ${styles.google}`}
          >
            Log In with Google
          </Button>
          <div className={styles.divider}>or</div>
        </>
      )} */}
      <Input
        clearable
        bordered
        fullWidth
        color="primary"
        size="sm"
        placeholder="Email"
        value={email}
        className={styles.input}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <Input
        clearable
        bordered
        fullWidth
        color="primary"
        size="sm"
        placeholder="Password"
        value={password}
        className={styles.input}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button
        color="primary"
        onPress={handleLogin}
        className={styles.button}
        isLoading={loading}
      >
        Log In
      </Button>
      <p className={styles.signupLink}>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginForm;
