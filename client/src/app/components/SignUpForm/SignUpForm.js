'use client';

import { Button, Input } from '@nextui-org/react';
import { toast } from 'sonner';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import segmentTrack from '../../helpers/segment/segmentTrack';
import isInAppBrowser from '../../helpers/isInAppBrowser';
import isValidPassword from '../../helpers/isValidPassword';
import styles from './SignUpForm.module.css';
import Link from 'next/link';

const SignUpForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!firstName || !lastName) {
      setError('Please enter both first and last name.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    segmentTrack('traditional_sign_up_triggered', { email });
    setError('');
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/public/create-account`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      },
    );

    const resData = await res.json();

    if (res.ok) {
      toast.success(
        'Account created. Please check your email for a confirmation link.',
      );
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(resData.error || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      {success && (
        <div className={styles.success}>
          <div className={styles.successTitle}>Almost there!</div>
          <p className={styles.successMessage}>
            Please <span>check your email</span> for a confirmation link to
            complete your account setup.
          </p>
        </div>
      )}
      {!success && (
        <>
          {!isInAppBrowser() && (
            <>
              <Button
                color="primary"
                onPress={() => {
                  segmentTrack('click_sign_up_google', {
                    location: 'page',
                  });
                  signIn('google', { callbackUrl: '/dashboard' });
                }}
                className={`${styles.button} ${styles.google}`}
              >
                Sign Up with Google
              </Button>
              <div className={styles.divider}>or</div>
            </>
          )}
          <div className={styles.row}>
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="sm"
              placeholder="First Name"
              className={styles.input}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="sm"
              placeholder="Last Name"
              className={styles.input}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
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
            onPress={handleSignUp}
            className={styles.button}
            isLoading={loading}
          >
            Sign Up
          </Button>
          <p className={styles.loginLink}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default SignUpForm;
