'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React, { useCallback, useState } from 'react';
import isValidUrl from '../../helpers/isValidUrl';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './EnterUrlForm.module.css';
import useStore from '../../store';

const EnterUrlForm = ({ className, onSuccess }) => {
  const { user } = useStore();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    if (!isValidUrl(url)) {
      toast.error('Invalid URL. Please enter a valid URL.');
      return;
    }
    try {
      setLoading(true);

      toast.promise(
        fetch(process.env.NEXT_PUBLIC_STELLAR_API + '/public/onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }),
        {
          loading: 'Scrapping page & creating experiments...',
          success: async (response) => {
            setLoading(false);
            // TODO: Idealmente todo esto vendría desde onSuccess, eventualmente deberíamos refactorizarlo
            const parsedResponse = await response.json();
            if (!user) {
              router.push(`/onboard/${parsedResponse.project.id}`);
            } else {
              await onSuccess(parsedResponse.project);
            }
            return 'Experiments created successfully';
          },
          error: (error) => {
            console.error('Fetch error:', error);
            setLoading(false);
            return 'An error occured while creating experiments.';
          },
        },
      );
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [url, router]);

  return (
    <div className={`${styles.EnterUrlForm} ${className}`}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className={styles.inputAndHelpText}>
          <Input
            className={styles.input}
            placeholder="http://your-landing-page.com"
            onChange={(e) => setUrl(e.target.value)}
            value={url}
          />
        </div>
        <Button
          disabled={loading}
          loading={loading}
          className={styles.button}
          type="submit"
        >
          Go Stellar
        </Button>
      </form>
    </div>
  );
};

export default EnterUrlForm;
