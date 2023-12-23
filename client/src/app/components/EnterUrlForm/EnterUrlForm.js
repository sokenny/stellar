'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import Button from '../Button/Button';
import styles from './EnterUrlForm.module.css';

const EnterUrlForm = () => {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ website_url: url }),
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      router.push('/journey/47/review');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [url]);
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
          <input
            className={styles.input}
            placeholder="http://yoursite.com"
            onChange={(e) => setUrl(e.target.value)}
          />
          {loading && (
            <span className={styles.helpText}>
              analyzing page and fetching experiments...
            </span>
          )}
        </div>
        <Button disabled={loading} loading={loading}>
          go stellar
        </Button>
      </form>
    </div>
  );
};

export default EnterUrlForm;
