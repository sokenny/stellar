'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '../../../../components/Button/Button';
import styles from './LaunchButton.module.css';

const LaunchButton = ({ journeyId, disabled }) => {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  async function handleLaunchJourney() {
    try {
      setIsLaunching(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/journey/${journeyId}/launch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const status = response.status;
      const parsedResponse = await response.json();

      if (status !== 200) {
        alert(parsedResponse.message);
        throw new Error(parsedResponse.message);
      }

      router.push('/');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLaunching(false);
    }
  }
  return (
    <div className={styles.LaunchButton}>
      <Button
        onClick={handleLaunchJourney}
        loading={isLaunching}
        disabled={isLaunching || disabled}
      >
        Launch Journey
      </Button>
    </div>
  );
};

export default LaunchButton;
