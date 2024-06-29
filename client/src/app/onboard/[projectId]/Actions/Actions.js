'use client';

import { useState, useEffect, useRef } from 'react'; // Import useRef
import { signIn } from 'next-auth/react';
import Button from '../../../components/Button/Button';
import styles from './Actions.module.css';

const Actions = ({ projectId, authenticated }) => {
  const actionsRef = useRef(null);
  const [isFloating, setIsFloating] = useState(false);
  const canChange = useRef(true);

  const handleScroll = () => {
    if (actionsRef.current) {
      const { bottom } = actionsRef.current.getBoundingClientRect();
      const nextIsFloating = bottom > window.innerHeight;
      // Only update if 'canChange' is true and the new state differs from the current
      if (canChange.current && nextIsFloating !== isFloating) {
        setIsFloating(nextIsFloating);
        canChange.current = false;
        setTimeout(() => {
          canChange.current = true;
        }, 150);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFloating]);

  return (
    <>
      {authenticated ? (
        <div className={styles.fullPageLoader}>
          <div>Redirecting to dashboard :) ...</div>
        </div>
      ) : (
        <div
          ref={actionsRef}
          className={
            isFloating ? `${styles.actions} ${styles.floating}` : styles.actions
          }
        >
          {['staticButton', 'floatingButton'].map((btn) => (
            <Button
              className={styles[btn]}
              onClick={() => {
                signIn('google', {
                  callbackUrl: `/onboard/${projectId}?authenticated=true`,
                });
              }}
            >
              Create Account with Experiments
            </Button>
          ))}
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
