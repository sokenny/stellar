'use client';

import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button/Button';

const SetUpGoal = ({ experimentId }) => {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push(`/set-goal/${experimentId}`)}>
        Set Up Goal For This Experiment
      </Button>
    </div>
  );
};

export default SetUpGoal;
