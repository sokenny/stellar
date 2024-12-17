import React, { useState } from 'react';
import { Button as NextUIButton } from '@nextui-org/react';
import useStore from '../../store';
import InfoCard from '../InfoCard';
import Button from '../Button';
import { toast } from 'sonner';
import styles from './EmailVerificationRequired.module.css';

const EmailVerificationRequired = ({ className, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useStore();

  function handleResendVerification() {
    setLoading(true);
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/api/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An unknown error occurred');
        }
        return response;
      }),
      {
        loading: 'Sending verification email...',
        success: () => {
          setLoading(false);
          return 'Verification email sent!';
        },
        error: (e) => {
          setLoading(false);
          return e.message || 'Error sending verification email';
        },
      },
    );
  }

  return (
    <InfoCard className={`${styles.container} ${className}`} theme="warning">
      <div className={styles.cardBody}>
        <div>
          <div className={styles.cardTitle}>Email Verification Required</div>
          <div>
            Please verify your email address to get full access to all features.
            Check your inbox for the verification link.
          </div>
          {/* <div className={styles.cardActions}>
            <NextUIButton
              color="primary"
              variant="light"
              className={styles.supportBtn}
              onClick={() => {
                window.open('mailto:support@stellar.com', '_blank');
              }}
            >
              Contact Support
            </NextUIButton>
            <Button onClick={handleResendVerification} loading={loading}>
              Resend Verification Email
            </Button>
          </div> */}
        </div>
      </div>
    </InfoCard>
  );
};

export default EmailVerificationRequired;
