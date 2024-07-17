'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React, { useCallback, useState } from 'react';
import isValidUrl from '../../helpers/isValidUrl';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './CreateSimpleProjectForm.module.css';

const CreateSimpleProjectForm = ({ className, onSuccess, isHomePage }) => {
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
        fetch(process.env.NEXT_PUBLIC_STELLAR_API + '/api/project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }),
        {
          loading: 'Creating project...',
          success: async (response) => {
            setLoading(false);
            const parsedResponse = await response.json();
            console.log(parsedResponse);
            // refresh browser page
            window?.location?.reload();
            return 'Project created successfully';
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
    <div className={`${styles.CreateSimpleProjectForm} ${className}`}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          window?.gtag?.('event', 'click_create_project', {
            url,
          });
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
          Create Project
        </Button>
      </form>
    </div>
  );
};

export default CreateSimpleProjectForm;
