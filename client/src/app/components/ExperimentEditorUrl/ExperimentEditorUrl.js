import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './ExperimentEditorUrl.module.css';
import isUrlFromDomain from '../../helpers/isUrlFromDomain';
import useStore from '../../store';

const ExperimentEditorUrl = ({ experiment, onSuccess, error }) => {
  const { currentProject, refetchProjects } = useStore();
  const [editorUrl, setEditorUrl] = useState(experiment?.editor_url || '');
  const [editorUrlSubmitting, setEditorUrlSubmitting] = useState(false);
  const [isEditorUrlPristine, setIsEditorUrlPristine] = useState(true);

  useEffect(() => {
    setEditorUrl(experiment?.editor_url || '');
    setIsEditorUrlPristine(true);
  }, [experiment?.editor_url]);

  const isEditorUrlValid = () => {
    if (!editorUrl) return false;
    return isUrlFromDomain(editorUrl, currentProject.domain);
  };

  async function handleEditorUrlSubmit() {
    if (!isEditorUrlValid()) return;

    setEditorUrlSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/editor-url`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            editor_url: editorUrl,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to update editor URL');

      await refetchProjects();
      toast.success('Editor URL updated successfully');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update editor URL');
    } finally {
      setEditorUrlSubmitting(false);
    }
  }

  return (
    <div className={styles.editorUrl} id="experiment-editor-url">
      <div className={styles.stepHeader}>
        <div className={styles.texts}>
          <div className={styles.stepTitle}>Visual Editor URL</div>
          <div className={styles.stepLegend}>
            Specify the URL where you'll make your visual changes for the
            variants.
          </div>
        </div>
      </div>
      <div className={styles.editorUrlInputGroup}>
        <Input
          type="text"
          value={editorUrl}
          onChange={(e) => {
            setEditorUrl(e.target.value);
            setIsEditorUrlPristine(false);
          }}
          placeholder={`https://${currentProject.domain}/your-editor-url`}
          className={styles.editorUrlInput}
        />
        <div className={styles.hint}>
          {!isEditorUrlValid() && editorUrl && (
            <div className={styles.error}>
              URL must be part of{' '}
              <a
                href={`https://${currentProject.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentProject.domain}
              </a>
            </div>
          )}
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <Button
          className={styles.editorUrlSaveButton}
          onClick={handleEditorUrlSubmit}
          loading={editorUrlSubmitting}
          disabled={
            editorUrlSubmitting || !isEditorUrlValid() || isEditorUrlPristine
          }
        >
          Save URL
        </Button>
      </div>
    </div>
  );
};

export default ExperimentEditorUrl;
