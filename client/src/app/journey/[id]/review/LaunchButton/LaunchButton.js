'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/app/components/Button/Button';
import styles from './LaunchButton.module.css';

const LaunchButton = ({ journeyId }) => {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  async function handleLaunchJourney() {
    try {
      setIsLaunching(true);
      const response = await fetch(
        `http://localhost:3001/api/journey/${journeyId}/launch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const parsedResponse = await response.json();
      console.log('parsedResponse', parsedResponse);

      // redirect to dashboard with success toast
      router.push('/dashboard');
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
        disabled={isLaunching}
      >
        Launch Journey
      </Button>
    </div>
  );
};

export default LaunchButton;
