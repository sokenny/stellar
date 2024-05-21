'use client';

import { useEffect, useState } from 'react';
import useStore from '../../store';
import { Tooltip } from '@nextui-org/react';
import Link from 'next/link';
import Edit from '../../icons/Edit';
import Trash from '../../icons/Trash';
import DownArrow from '../../icons/DownArrow';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import getVariantsTrafficInitialValues from '../../helpers/getVariantsTrafficInitialValues';
import getSortedVariants from '../../helpers/getSortedVariants';
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
import Plus from '../../icons/Plus';
import CreateButton from '../CreateButton';

const Experiment = ({
  experiment,
  order = '',
  open = true,
  isFirst = false,
  onReview = false,
  cardLike = false,
}) => {
  const { stats, setStats } = useStore();
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

  console.log('on review: ', onReview);

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

  const experimentTitle = name + ' - #' + experiment.id;

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
        <div className={styles.colLeft}>
          {/* {onReview && <div className={styles.order}>{order}</div>} */}
          <div className={styles.name}>
            {onReview ? (
              <div>{experimentTitle}</div>
            ) : (
              <Link href={`/experiment/${experiment.id}`}>
                {experimentTitle}
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

              {/* <div
                className={styles.editExperiment}
                onClick={() => setShowEditExperimentModal(true)}
              >
                <Edit height={17} />
              </div> */}
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
          <div className={styles.status}>
            {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
            {experiment.status}
          </div>
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
            <div className={styles.viewDetails} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>
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
                {/* {isAlterable && (
                  <CreateButton
                    height={18}
                    onClick={() => setShowCreateVariantModal(true)}
                  />
                )} */}
              </div>
              <div className={styles.variantsContainer}>
                {sortedVariants.map((variant, i) => (
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
                  />
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
                    disableAnimation
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
