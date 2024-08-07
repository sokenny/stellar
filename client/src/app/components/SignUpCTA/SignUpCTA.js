'use client';

import { signIn } from 'next-auth/react';
import Button from '../Button';
import styles from './SignUpCTA.module.css';
import segmentTrack from '../../helpers/segment/segmentTrack';

const SignUpCTA = ({ children, className }) => {
  return (
    <Button
      className={
        className ? `${styles.SignUpCTA} ${className}` : styles.SignUpCTA
      }
      type="submit"
      onClick={() => {
        segmentTrack('click_sign_up', {
          location: 'home',
          children,
        });
        signIn('google', {
          callbackUrl: '/dashboard',
        });
      }}
    >
      {children}
    </Button>
  );
};

export default SignUpCTA;
