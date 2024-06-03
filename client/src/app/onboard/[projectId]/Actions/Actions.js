'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Button from '../../../components/Button/Button';
import styles from './Actions.module.css';

const Actions = ({ projectId, authenticated }) => {
  const router = useRouter();
  const { data: session } = useSession();

  console.log('session: ', session);

  useEffect(() => {
    async function finishOnboarding() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/finish-onboarding/${projectId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: session.user.email }),
        },
      );

      console.log('response: ', response);
      if (response.ok) {
        console.log('User finished onboarding');
        router.push('/dashboard');
      }
    }
    if (authenticated && session) {
      // send request to /finish-onboarding
      finishOnboarding();
    }
  }, [authenticated, session]);
  return (
    <>
      {authenticated ? (
        <div className={styles.fullPageLoader}>
          <div>Redirecting to dashboard :) ...</div>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button
            onClick={() => {
              signIn('google', {
                callbackUrl: `/onboard/${projectId}?authenticated=true`,
              });
            }}
          >
            Create Account with Experiments
          </Button>
          <div className={styles.disclaimer}>
            You can further edit your experiments and variants after creating
            your account.
          </div>
        </div>
      )}
    </>
  );
};

export default Actions;
