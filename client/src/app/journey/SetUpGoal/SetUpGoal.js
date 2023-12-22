'use client';

import { useRouter } from 'next/navigation';
import Button from '../../components/Button/Button';

const SetUpGoal = ({ experimentId }) => {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push(`/set-goal/${experimentId}`)}>
        Set Up Goal
      </Button>
    </div>
  );
};

export default SetUpGoal;
