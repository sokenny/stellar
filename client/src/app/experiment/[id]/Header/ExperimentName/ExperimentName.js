import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import useStore from '../../../../store';
import styles from './ExperimentName.module.css';

const ExperimentName = ({ name, experimentId }) => {
  const { refetchProjects } = useStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const nameRef = useRef(null);
  useEffect(() => {
    if (isEditingName) {
      nameRef.current.focus();
      document.execCommand('selectAll', false, null);
    }
  }, [isEditingName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      nameRef.current.blur();
    }
  };

  const handleBlur = async () => {
    const newName = nameRef.current.textContent;
    if (newName === name || newName.trim() === '') {
      setIsEditingName(false);
      nameRef.current.textContent = name;
      return;
    }

    try {
      toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}/name`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName }),
          },
        ),
        {
          loading: 'Updating experiment name...',
          success: async () => {
            refetchProjects();
            return 'Experiment name updated';
          },
          error: async () => `Failed to update experiment name`,
        },
      );
      setIsEditingName(false);
    } catch (error) {
      console.error('Save failed:', error);
      nameRef.current.textContent = name;
    }
  };

  return (
    <h1
      ref={nameRef}
      contentEditable={isEditingName}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={styles.title}
      onClick={() => !isEditingName && setIsEditingName(true)}
      style={{ cursor: 'text', display: 'inline-block' }} // Styles for better usability
    >
      {name}
    </h1>
  );
};

export default ExperimentName;
