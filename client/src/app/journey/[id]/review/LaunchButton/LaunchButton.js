'use client';

import Button from '@/app/components/Button/Button';
import styles from './LaunchButton.module.css';

const LaunchButton = ({ journeyId }) => {
  async function handleLaunchJourney() {}
  return (
    <div className={styles.LaunchButton}>
      <Button onClick={handleLaunchJourney}>Launch Journey</Button>
    </div>
  );
};

export default LaunchButton;
