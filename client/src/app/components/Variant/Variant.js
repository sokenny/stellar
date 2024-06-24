'use client';

import { useState, useRef, useEffect } from 'react';
import { Tooltip } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import Edit2 from '../../icons/Edit2';
import Edit from '../../icons/Edit';
import Trash from '../../icons/Trash';
import Delete2 from '../../icons/Delete2';
import VariantModal from '../Modals/VariantModal/VariantModal';
import DeleteVariantModal from '../Modals/DeleteVariantModal';
import Stats from './Stats/Stats';
import styles from './Variant.module.css';

const Variant = ({
  id,
  experiment,
  variants,
  stats,
  height,
  setHeight,
  className,
  onReview,
  // num,
}) => {
  const variantRef = useRef(null);
  const thisVariant = variants.find((v) => v.id === id);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const showStats = !!experiment.started_at;

  // text of thisVariant needs to be lookedup in thisVariant.modifications where innerText has some text
  const text = thisVariant.modifications.find((m) => m.innerText)?.innerText;

  const num = variants.findIndex((v) => v.id === id) + 1;

  useEffect(() => {
    if (variantRef.current) {
      const h = variantRef.current.offsetHeight;
      if (h > height) {
        setHeight(h);
      }
    }
  }, [variantRef, height, setHeight]);

  const canAlterVariant =
    (experiment.status === ExperimentStatusesEnum.QUEUED ||
      experiment.status === ExperimentStatusesEnum.PENDING) &&
    !thisVariant.is_control;

  return (
    <div
      className={`${styles.Variant} 
      ${thisVariant.is_control ? styles.isControl : ''}
      ${showStats ? styles.showStats : ''}
      ${className}
      `}
    >
      <div
        className={styles.mainInfo}
        ref={variantRef}
        style={{
          minHeight: height,
        }}
      >
        {/* TODO: add link to "preview variant" that takes you to preview mode of the variant */}
        <div className={styles.header}>
          <div className={styles.colLeft}>
            <div className={styles.title}>
              #{num} - {id}
            </div>
            {thisVariant.is_control && (
              <div className={styles.original}>original</div>
            )}
          </div>
          <div className={styles.actionButtons}>
            {canAlterVariant && (
              <div
                className={styles.delete}
                onClick={() => setShowDeleteVariantModal(true)}
              >
                <Trash height={18} width={18} />
              </div>
            )}
            <Tooltip
              content={
                'You can edit this variant once your account has been created.'
              }
              showArrow
              className={styles.tooltip}
              closeDelay={0}
              isDisabled={!onReview}
            >
              <div
                className={`${styles.edit} ${onReview ? styles.disabled : ''}`}
                onClick={() => !onReview && setShowEditVariantModal(true)}
              >
                <Edit width={15} height={15} />
              </div>
            </Tooltip>
          </div>
        </div>
        <div className={styles.text}>
          <span className={styles.label}>Text: </span>
          <a
            href={`${experiment.url}?stellarMode=true&modificationType=text&text=${thisVariant.text}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        </div>
        <div className={styles.traffic}>
          <span className={styles.label}>Traffic: </span>
          {thisVariant.traffic}%
        </div>
        <div className={styles.description}>{thisVariant.description}</div>
        {showEditVariantModal && (
          <VariantModal
            onClose={() => setShowEditVariantModal(false)}
            initialValues={{
              text: thisVariant.text,
              ...getVariantsTrafficInitialValues(variants),
            }}
            variants={variants}
            id={thisVariant.id}
            experiment={experiment}
          />
        )}
        {showDeleteVariantModal && (
          <DeleteVariantModal
            onClose={() => setShowDeleteVariantModal(false)}
            variantId={thisVariant.id}
          />
        )}
      </div>
      {showStats && <Stats stats={stats} />}
    </div>
  );
};

export default Variant;
