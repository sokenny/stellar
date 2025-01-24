'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React, { useCallback, useState } from 'react';
import isValidDomain from '../../helpers/isValidDomain';
import getDomainFromUrl from '../../helpers/getDomainFromUrl';
import segmentTrack from '../../helpers/segment/segmentTrack';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './CreateSimpleProjectForm.module.css';
import useStore from '../../store';

const CreateSimpleProjectForm = ({ className, onSuccess, isHomePage }) => {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useStore();

  const onSubmit = useCallback(async () => {
    if (!isValidDomain(domain)) {
      toast.error('Please enter a valid domain - without http:// or https://');
      return;
    }

    try {
      setLoading(true);
      toast.promise(
        fetch(process.env.NEXT_PUBLIC_STELLAR_API + '/api/project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ domain }),
        }),
        {
          loading: 'Creating project...',
          success: async (response) => {
            setLoading(false);
            const parsedResponse = await response.json();
            localStorage.setItem(
              'lastSelectedProject',
              parsedResponse.project.id,
            );
            window?.location?.reload();
            return 'Project created successfully';
          },
          error: (error) => {
            console.error('Fetch error:', error);
            setLoading(false);
            return 'An error occured while creating project.';
          },
        },
      );
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [domain, router]);

  return (
    <div className={`${styles.CreateSimpleProjectForm} ${className}`}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          segmentTrack('click_create_project', {
            domain,
          });
          onSubmit();
        }}
      >
        <div className={styles.inputAndHelpText}>
          <Input
            className={styles.input}
            placeholder="your-domain.com"
            onChange={(e) => setDomain(e.target.value)}
            value={domain}
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
