'use client';

import { useRouter } from 'next/navigation';
import Button from '../../../components/Button/Button';

const Continue = ({ journeyId }) => {
  const router = useRouter();
  console.log('router: ', router);
  return (
    <div>
      <Button onClick={() => router.push(`/journey/${journeyId}/review`)}>
        Continue
      </Button>
    </div>
  );
};

export default Continue;
