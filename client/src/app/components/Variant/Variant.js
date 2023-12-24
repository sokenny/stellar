import { useState } from 'react';
import Edit from '../../icons/Edit';
import EditVariantModal from '../EditVariantModal/EditVariantModal';
import styles from './Variant.module.css';

const Variant = ({ variant, n }) => {
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  return (
    <div
      className={`${styles.Variant} ${
        variant.is_control ? styles.isControl : ''
      }`}
    >
      {/* TODO: add link to "preview variant" that takes you to preview mode of the variant */}
      <div className={styles.header}>
        <div className={styles.colLeft}>
          <div className={styles.title}>#{n}</div>
          {variant.is_control && (
            <div className={styles.original}>original</div>
          )}
        </div>
        {!variant.is_control && (
          <div
            className={styles.edit}
            onClick={() => setShowEditVariantModal(true)}
          >
            <Edit width={15} height={15} />
          </div>
        )}
      </div>
      <div className={styles.text}>
        <span className={styles.label}>Text: </span>
        {variant.text}
      </div>
      <div className={styles.traffic}>
        <span className={styles.label}>Traffic: </span>33%
      </div>
      <div className={styles.description}>{variant.description}</div>
      {showEditVariantModal && (
        <EditVariantModal
          onClose={() => setShowEditVariantModal(false)}
          initialValues={{
            text: variant.text,
            traffic: variant.traffic,
          }}
        />
      )}
    </div>
  );
};

export default Variant;
