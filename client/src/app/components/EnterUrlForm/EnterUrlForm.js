'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React, { useCallback, useState } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './EnterUrlForm.module.css';

const EnterUrlForm = () => {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('loading. ', loading);

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);

      // Display the "Scrapping main elements..." toast
      toast.promise(
        fetch(process.env.NEXT_PUBLIC_STELLAR_API + '/onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ website_url: url }),
        }),
        {
          loading: 'Scrapping main elements...',
          success: async (response) => {
            const parsedResponse = await response.json();
            console.log('parsedResponse', parsedResponse);

            // Redirect to the review page
            router.push(`/journey/${parsedResponse.journey.id}/review`);

            // Display the "Creating experiments..." toast
            return toast.promise(
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: 'Sonner' }), 2500),
              ),
              {
                loading: 'Creating experiments...',
                success: () => {
                  // Display the "Creating AI generated variants..." toast
                  return toast.promise(
                    new Promise((resolve) =>
                      setTimeout(() => resolve({ name: 'Sonner' }), 2500),
                    ),
                    {
                      loading: 'Creating AI generated variants...',
                      success: () => 'Variants created',
                    },
                  );
                },
              },
            );
          },
          error: (error) => {
            console.error('Fetch error:', error);
            throw error;
          },
        },
      );
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [url, router]);

  return (
    <div className={styles.EnterUrlForm}>
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
            placeholder="http://yoursite.com"
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
