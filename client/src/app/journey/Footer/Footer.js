'use client';

import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button/Button';

const Footer = ({ experimentId }) => {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push(`/set-goal/${experimentId}`)}>
        Continue
      </Button>
    </div>
  );
};

export default Footer;
