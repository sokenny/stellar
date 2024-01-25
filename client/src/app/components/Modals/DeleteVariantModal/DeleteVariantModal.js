import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import styles from './DeleteVariantModal.module.css';

const DeleteVariantModal = ({ onClose, variantId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleDeleteVariant() {
    setSubmitting(true);
    fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${variantId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        router.refresh();
        onClose();
      });
  }

  return (
    <Modal
      onClose={onClose}
      className={styles.DeleteVariantModal}
      showX={false}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to delete this variant?
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.deleteBtn}
            onClick={handleDeleteVariant}
            disabled={submitting}
            loading={submitting}
          >
            Delete Variant
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteVariantModal;
