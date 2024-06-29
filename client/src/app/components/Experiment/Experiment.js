'use client';

import { useEffect, useState, useRef } from 'react';
import useStore from '../../store';
import { Tooltip } from '@nextui-org/react';
import Link from 'next/link';
import Trash from '../../icons/Trash';
import DownArrow from '../../icons/DownArrow';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import getSortedVariants from '../../helpers/getSortedVariants';
import getRandomConversionRate from '../../helpers/getRandomConversionRate';
import Variant from '../Variant/Variant';
import Goal from '../Goal/Goal';
import StopButton from '../StopButton/StopButton';
import PlayButton from '../PlayButton/PlayButton';
import PauseButton from '../PauseButton/PauseButton';
import VariantModal from '../Modals/VariantModal/VariantModal';
import GoalSetupModal from '../Modals/GoalSetupModal/GoalSetupModal';
import EditExperimentModal from '../Modals/EditExperimentModal/EditExperimentModal';
import PauseExperimentModal from '../Modals/PauseExperimentModal/PauseExperimentModal';
import ResumeExperimentModal from '../Modals/ResumeExperimentModal/ResumeExperimentModal';
import StopExperimentModal from '../Modals/StopExperimentModal/StopExperimentModal';
import DeleteExperimentModal from '../Modals/DeleteExperimentModal/DeleteExperimentModal';
import Button from '../Button/Button';
import styles from './Experiment.module.css';

const Experiment = ({
  experiment,
  order = '',
  open = true,
  isFirst = false,
  onReview = false,
  cardLike = false,
}) => {
  const hoverTimeoutId = useRef(null);
  const { stats, setStats } = useStore();
  const [variantHovered, setVariantHovered] = useState(null);
  const [maxVariantHeight, setMaxVariantHeight] = useState(null);
  const { name, variants, goal, url } = experiment;
  const [isOpen, setIsOpen] = useState(open);
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const [showStopExperimentModal, setShowStopExperimentModal] = useState(false);
  const [showPauseExperimentModal, setShowPauseExperimentModal] =
    useState(false);
  const [showResumeExperimentModal, setShowResumeExperimentModal] =
    useState(false);
  const [showEditExperimentModal, setShowEditExperimentModal] = useState(false);
  const [showDeleteExperimentModal, setShowDeleteExperimentModal] =
    useState(false);
  const [showCreateVariantModal, setShowCreateVariantModal] = useState(false);
  const [isGoalTooltipOpen, setIsGoalTooltipOpen] = useState(false);

  function getImageTargetUrl() {
    const isControl = experiment.variants.find(
      (v) => v.is_control && v.id === variantHovered,
    );
    if (isControl || !variantHovered) {
      return `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/snapshot`;
    }
    return `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/${variantHovered}/snapshot`;
  }

  useEffect(() => {
    return () => {
      hoverTimeoutId.current && clearTimeout(hoverTimeoutId.current);
    };
  }, [hoverTimeoutId.current]);

  useEffect(() => {
    const fetchExperimentStats = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await res.json();
      setStats(experiment.id, data);
    };

    if (experiment.started_at && !stats[experiment.id]) {
      fetchExperimentStats();
    }
  }, [stats, experiment]);

  const sortedVariants = getSortedVariants(variants);

  sortedVariants.forEach((v, i) => {
    v.num = i + 1;
  });

  const isAlterable =
    experiment.status === ExperimentStatusesEnum.QUEUED ||
    experiment.status === ExperimentStatusesEnum.PENDING;

  const showStopPlayPauseButtons =
    (experiment.status === ExperimentStatusesEnum.RUNNING ||
      experiment.status === ExperimentStatusesEnum.PAUSED ||
      experiment.status === ExperimentStatusesEnum.PENDING) &&
    !onReview;

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }
      ${isFirst ? styles.isFirst : ''}
      ${styles[experiment.status]}
      ${cardLike ? styles.cardLike : ''}
      `}
      onClick={() => (!isOpen ? setIsOpen(true) : null)}
    >
      <div className={styles.header}>
        <div className={styles.row1}>
          <div className={styles.colLeft}>
            {/* TODO-p1-1: Add experiment icon here https://fontawesome.com/search?q=experiment&o=r&m=free */}
            <div className={styles.name}>
              {onReview ? (
                <div>{experiment.name}</div>
              ) : (
                <Link href={`/experiment/${experiment.id}`}>
                  {experiment.name}
                </Link>
              )}
            </div>
            {isOpen && (
              <div className={styles.experimentActions}>
                {isAlterable && (
                  <div className={styles.deleteBtn}>
                    <Trash
                      height={21}
                      onClick={() => setShowDeleteExperimentModal(true)}
                    />
                  </div>
                )}
              </div>
            )}
            {!isOpen && (
              <div className={styles.downArrow}>
                {' '}
                <DownArrow width={14} />
              </div>
            )}
          </div>

          <div className={styles.colRight}>
            {!onReview && (
              <div className={styles.status}>
                {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
                {experiment.status}
              </div>
            )}
            <div className={styles.action}>
              {showStopPlayPauseButtons && (
                <div className={styles.stopPlayPauseButtons}>
                  {experiment.status !== ExperimentStatusesEnum.PENDING && (
                    <StopButton
                      onClick={() => setShowStopExperimentModal(true)}
                    />
                  )}
                  {experiment.status === ExperimentStatusesEnum.RUNNING ? (
                    <PauseButton
                      onClick={() => setShowPauseExperimentModal(true)}
                    />
                  ) : (
                    <PlayButton
                      onClick={() => setShowResumeExperimentModal(true)}
                    />
                  )}
                </div>
              )}
            </div>
            {!isOpen && (
              <div
                className={styles.viewDetails}
                onClick={() => setIsOpen(true)}
              >
                View Details
              </div>
            )}
          </div>
        </div>
        {onReview && (
          <Tooltip
            content="Based on historical data from similar experiments."
            showArrow
            className={styles.tooltip}
            closeDelay={200}
          >
            <div className={styles.potentialCR}>
              Estimated{' '}
              <span>
                {getRandomConversionRate({
                  seed: experiment.id,
                  experimentType: name,
                })}
                % potential CR increase
              </span>
              .
            </div>
          </Tooltip>
        )}
      </div>
      <img src={getImageTargetUrl()} className={styles.targetElementImage} />
      {isOpen && (
        <>
          {experiment.started_at && !experiment.ended_at && (
            <div className={styles.dates}>
              <div className={styles.date}>
                <div className={styles.dateLabel}>Start date:</div>
                <div className={styles.dateValue}>
                  {new Date(experiment.started_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className={styles.variants}>
              <div className={styles.variantsHeader}>
                <div className={styles.variantsTitle}>
                  Variants ({variants.length})
                </div>
              </div>
              <div className={styles.variantsContainer}>
                {/* TODO-p1-2: Have hover effect when hovering over variants */}
                {sortedVariants.map((variant, i) => (
                  <div
                    onMouseEnter={() => setVariantHovered(variant.id)}
                    onMouseLeave={() =>
                      (hoverTimeoutId.current = setTimeout(() => {
                        setVariantHovered(null);
                      }, 200))
                    }
                  >
                    <Variant
                      key={variant.id}
                      id={variant.id}
                      variants={sortedVariants}
                      experiment={experiment}
                      stats={stats[experiment.id]?.find(
                        (s) => s.variantId === variant.id,
                      )}
                      height={maxVariantHeight}
                      setHeight={setMaxVariantHeight}
                      onReview={onReview}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.bottomRow}>
              {goal ? (
                <Goal
                  goal={goal}
                  experimentStatus={experiment.status}
                  experimentUrl={experiment.url}
                  onEdit={() => setShowSetUpGoalModal(true)}
                />
              ) : (
                <div>
                  <Tooltip
                    isOpen={isGoalTooltipOpen}
                    onOpenChange={(isOpen) =>
                      setIsGoalTooltipOpen(onReview ? isOpen : false)
                    }
                    showArrow
                    content="Available after installing our tracking code in your
                    website."
                    className={styles.goalTooltip}
                    closeDelay={0}
                  >
                    <div className={styles.setUpGoalBtn}>
                      <Button
                        onClick={() => setShowSetUpGoalModal(true)}
                        disabled={onReview}
                      >
                        Set up goal
                      </Button>
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showSetUpGoalModal && (
        <GoalSetupModal
          experiment={experiment}
          onClose={() => setShowSetUpGoalModal(false)}
          goal={goal}
        />
      )}
      {showEditExperimentModal && (
        <EditExperimentModal
          onClose={() => setShowEditExperimentModal(false)}
          initialValues={{
            name: experiment.name,
            order,
          }}
          experiment={experiment}
        />
      )}
      {showStopExperimentModal && (
        <StopExperimentModal
          onClose={() => setShowStopExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
      {showPauseExperimentModal && (
        <PauseExperimentModal
          onClose={() => setShowPauseExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
      {showResumeExperimentModal && (
        <ResumeExperimentModal
          onClose={() => setShowResumeExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
      {showDeleteExperimentModal && (
        <DeleteExperimentModal
          onClose={() => setShowDeleteExperimentModal(false)}
          experimentId={experiment.id}
          onComplete={() => (onReview ? location.reload() : null)}
        />
      )}
      {showCreateVariantModal && (
        <VariantModal
          onClose={() => setShowCreateVariantModal(false)}
          experiment={experiment}
          variants={variants}
          isEditing={false}
          initialValues={{
            ...getVariantsTrafficInitialValues(variants),
          }}
        />
      )}
    </div>
  );
};

export default Experiment;
