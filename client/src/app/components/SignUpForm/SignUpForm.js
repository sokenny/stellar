'use client';

import { Button, Input } from '@nextui-org/react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import segmentTrack from '../../helpers/segment/segmentTrack';
import isInAppBrowser from '../../helpers/isInAppBrowser';
import isValidPassword from '../../helpers/isValidPassword';
import styles from './SignUpForm.module.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const SignUpForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [showAffiliateSection, setShowAffiliateSection] = useState(false);
  const searchParams = useSearchParams();
  const codeValidationAttempted = useRef(false);

  console.log('affiliateCode', affiliateCode);

  useEffect(() => {
    const code = searchParams.get('affiliateCode');
    if (code && !codeSuccess && !codeValidationAttempted.current) {
      setShowAffiliateSection(true);
      setAffiliateCode(code);
      codeValidationAttempted.current = true;
      setTimeout(() => validateAffiliateCode(code), 0);
    }
  }, [searchParams]);

  const handleSignUp = async () => {
    if (!firstName || !lastName) {
      setError('Please enter both first and last name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
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
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          ...(codeSuccess && { affiliateCode }),
        }),
      },
    );

    const resData = await res.json();

    if (res.ok) {
      toast.success(
        'Account created. Please check your email for a confirmation link.',
      );
      setSuccess(true);

      // Automatically log in the user
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        toast.error('Failed to log in after sign up');
      } else {
        toast.success('Logged in successfully');
        window.location.href = '/dashboard';
      }
    } else {
      toast.error(resData.error || 'Failed to create account');
    }
    setLoading(false);
  };

  const validateAffiliateCode = async (codeToValidate) => {
    const codeToUse = codeToValidate || affiliateCode;
    if (!codeToUse) return;
    setApplyingCode(true);
    console.log('codeToUse', codeToUse);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/public/validate-affiliate-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: codeToUse }),
        },
      );

      const data = await res.json();

      if (data.valid) {
        console.log('esto correee data');
        setCodeSuccess(true);
        toast.success('Affiliate code applied successfully!');
      } else {
        toast.error(data.error || 'Invalid affiliate code');
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Failed to validate affiliate code');
    } finally {
      setApplyingCode(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* {success && (
        <div className={styles.success}>
          <div className={styles.successTitle}>Almost there!</div>
          <p className={styles.successMessage}>
            Please <span>check your email</span> for a confirmation link to
            complete your account setup.
          </p>
        </div>
      )} */}
      {/* {!success && ( */}
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

        <div className={styles.affiliateCodeSection}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="showAffiliateCode"
              checked={showAffiliateSection}
              onChange={(e) => setShowAffiliateSection(e.target.checked)}
            />
            <label htmlFor="showAffiliateCode">Have an affiliate code?</label>
          </div>

          {showAffiliateSection && (
            <>
              <div className={styles.affiliateCodeRow}>
                <Input
                  clearable
                  bordered
                  color="default"
                  size="sm"
                  placeholder="Enter code"
                  value={affiliateCode}
                  className={styles.affiliateInput}
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  disabled={codeSuccess}
                />
                {!codeSuccess && (
                  <Button
                    color="secondary"
                    size="sm"
                    className={styles.applyButton}
                    isLoading={applyingCode}
                    onClick={() => validateAffiliateCode()}
                  >
                    Apply
                  </Button>
                )}
              </div>
              {codeSuccess && (
                <div className={styles.codeSuccess}>
                  <div className={styles.successTitle}>
                    Code applied successfully! 🎉
                  </div>
                  <div>
                    This gives you 1 year free access to pro features such as:
                    <ul>
                      <li>✅ Up to 100k monthly users</li>
                      <li>✅ Dynamic keyword insertion</li>
                      <li>✅ Custom audience targeting</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

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
    </div>
  );
};

export default SignUpForm;
