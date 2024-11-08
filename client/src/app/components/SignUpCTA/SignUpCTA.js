'use client';

import Button from '../Button';
import { useRouter } from 'next/navigation';
import styles from './SignUpCTA.module.css';

const SignUpCTA = ({ children, className }) => {
  const router = useRouter();
  return (
    <Button
      className={
        className ? `${styles.SignUpCTA} ${className}` : styles.SignUpCTA
      }
      type="button"
      onClick={() => router.push('/signup')}
    >
      {children}
    </Button>
  );
};

export default SignUpCTA;
