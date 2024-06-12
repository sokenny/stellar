import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import styles from './VariantName.module.css';

const VariantName = ({ name, variantId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editedName === name) {
      console.log('No changes made.');
      setIsEditing(false);
      return;
    }
    try {
      toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${variantId}/name`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: editedName }),
          },
        ),
        {
          loading: 'Updating variant name...',
          success: 'Variant name updated',
          error: 'Failed to update variant name',
        },
      );
    } catch (error) {
      console.error('Save failed:', error);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
    }
  };

  return (
    <div className={styles.nameCell} onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <input
          type="text"
          ref={inputRef}
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className={styles.nameInput}
        />
      ) : (
        <div className={styles.nameContainer}>{editedName}</div>
      )}
    </div>
  );
};

export default VariantName;
