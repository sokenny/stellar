import React, { useState } from 'react';
import { Snippet, Button as NextUIButton } from '@nextui-org/react';
import useStore from '../../store';
import InfoCard from '../InfoCard';
import Button from '../Button';
import { toast } from 'sonner';
import styles from './SnippetMissing.module.css';
import getStellarClientCode from '../../helpers/getStellarClientCode';

// TODO-p1-1: Perhaps have part of the installed code that is actual JS directly pasted. mainly to include a loader.
// TODO-p1-1: The included JS can try intialize experiments that were cached in localstorage, which would be invalidated if the fetch request brings new changes saying the exp ended.
// 1- Script loads, looks for exp-id key in localstorage. If found, it mounts the exp without fetching from the server.
// 2- Once fetch is done, it checks if the exp-id is still valid. If not, it removes the exp from localstorage.
//    -Aside from removing the exp from localstorage, it will also remove the exp from the DOM.
//    -It will also set localStorage with any other experiment that was returned. So that the cache is updated.

const SnippetMissing = ({ className, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user, refetchProjects, currentProject } = useStore();
  const apiKey = user?.api_keys?.[0].key;

  function handleSnippetCheck() {
    setLoading(true);
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/api/check-snippet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url:
            (currentProject.domain.includes('localhost')
              ? 'http://'
              : 'https://') + currentProject.domain,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An unknown error occurred');
        }
        return response;
      }),
      {
        loading: 'Checking snippet...',
        success: async () => {
          setLoading(false);
          refetchProjects();
          onSuccess && onSuccess();
          return 'Snippet installation confirmed';
        },
        error: async (e) => {
          console.log(e);
          setLoading(false);
          return e.message || 'Error checking snippet - not found';
        },
      },
    );
  }

  return (
    <InfoCard className={`${styles.container} ${className}`}>
      {
        <div className={styles.cardBody}>
          <div>
            <div className={styles.cardTitle}>Snippet missing</div>
            <div>
              Place this snippet in the {'<head>'} tag of your website to start
              tracking and running your experiments:
            </div>
            <Snippet hideSymbol color="primary" className={styles.cardSnippet}>
              {getStellarClientCode(apiKey)}
            </Snippet>
            <div className={styles.cardActions}>
              <NextUIButton
                color="primary"
                variant="light"
                className={styles.seeHowBtn}
              >
                {/* TODO-p2: Armar pagina mostrando como instalarlo */}
                See how
              </NextUIButton>
              <Button onClick={handleSnippetCheck} loading={loading}>
                I've installed it
              </Button>
            </div>
          </div>
        </div>
      }
    </InfoCard>
  );
};

export default SnippetMissing;
