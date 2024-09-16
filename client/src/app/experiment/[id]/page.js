'use client';

import React, { useState } from 'react';
import {
  Tooltip,
  Spinner,
  useDisclosure,
  BreadcrumbItem,
  Breadcrumbs,
} from '@nextui-org/react';
import { toast } from 'sonner';
import getShortId from '../../helpers/getShortId';
import GoalIcon from '../../icons/Goal';
import Calendar from '../../icons/Calendar';
import Page from '../../icons/Page';
import VariantsTable from '../../components/VariantsTable/VariantsTable';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '../../store';
import Notifications from '../Notifications';
import GoalSetupModal from '../../components/Modals/GoalSetupModal/GoalSetupModal';
import InfoCard from '../../components/InfoCard';
import Goal from '../../components/Goal';
import Button from '../../components/Button';
import Header from './Header';
import CreateButton from '../../components/CreateButton';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import SnippetInstallationModal from '../../components/Modals/SnippetInstallationModal';
import StatsSwitch from '../../components/StatsSwitch/StatsSwitch';
import styles from './page.module.css';

// TODO-p1-2: Add a manage experiment tutorial

export default function ExperimentPage({ params, searchParams }) {
  const router = useRouter();
  const [statsType, setStatsType] = useState('total-sessions');
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const [creatingVariant, setCreatingVariant] = useState(false);
  const experimentId = params.id;
  const { user, currentProject, refetchProjects } = useStore();
  const missingSnippet = currentProject?.snippet_status !== 1;
  const loading = user === null;
  const experiment = currentProject?.experiments?.find(
    (e) => e.id == experimentId,
  );
  const {
    isOpen: isSnippetModalOpen,
    onOpen: onOpenSnippetModal,
    onOpenChange: onOpenSnippetModalChange,
  } = useDisclosure();

  const queuedAfter = currentProject?.experiments?.find(
    (e) => experiment.queue_after === e.id,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!experiment) {
    return <div>Experiment not found</div>;
  }

  const { goal } = experiment;
  const hasCeroChanges = experiment.variants.every(
    (variant) => variant.modifications?.length === 0,
  );

  async function handleCreateVariant() {
    setCreatingVariant(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/variant/${experiment.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Variant ${getShortId()}`,
          }),
        },
      );
      const variant = await response.json();
      toast.success('Variant created');
      refetchProjects();
      console.log(variant);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add variant');
    }
    setCreatingVariant(false);
  }

  const hasStarted = experiment.status !== ExperimentStatusesEnum.PENDING;
  const noGoalOrZeroChanges = !experiment.goal || hasCeroChanges;

  return (
    <>
      <SnippetInstallationModal
        isOpen={isSnippetModalOpen}
        onOpenChange={onOpenSnippetModalChange}
      />
      <Breadcrumbs className={styles.breadCrumbs}>
        <BreadcrumbItem onClick={() => router.push('/dashboard')}>
          Experiments
        </BreadcrumbItem>
        <BreadcrumbItem>{experiment.name}</BreadcrumbItem>
      </Breadcrumbs>
      {/* TODO-p2: If experiment has less than 5 days before it ends due to a shceduled end date, show an info card announcing this */}
      <div className={styles.Experiment}>
        <Notifications searchParams={searchParams} />
        <Header experiment={experiment} className={styles.header} />
        {noGoalOrZeroChanges && (
          <div className={styles.infoSection}>
            {!experiment.goal && (
              <InfoCard className={styles.setGoalCard}>
                {
                  <div className={styles.cardBody}>
                    <div>Set up a goal before launching your experiment.</div>
                    <div>
                      <Button
                        onClick={() =>
                          missingSnippet
                            ? onOpenSnippetModal()
                            : setShowSetUpGoalModal(true)
                        }
                      >
                        Set Up Goal
                      </Button>
                    </div>
                  </div>
                }
              </InfoCard>
            )}
            {hasCeroChanges && (
              <InfoCard className={styles.setGoalCard}>
                {
                  <div className={styles.cardBody}>
                    <div>
                      Modify at least one variant before launching your
                      experiment.
                    </div>
                  </div>
                }
              </InfoCard>
            )}
          </div>
        )}
        <div className={styles.generalInfoSection}>
          {experiment.goal && (
            <div className={styles.goal}>
              <div className={styles.icon}>
                <GoalIcon width={15} height={15} />
              </div>
              <Goal
                className={styles.goalCard}
                experiment={experiment}
                onEdit={() => setShowSetUpGoalModal(true)}
              />
            </div>
          )}
          <div className={styles.datesData}>
            <div className={styles.icon}>
              <Calendar width={15} height={15} />
            </div>
            {experiment.started_at && (
              <div className={styles.startDate}>
                Started at: <span>{experiment.started_at}</span>
              </div>
            )}
            {!experiment.started_at && experiment.scheduled_start_date && (
              <div className={styles.startDate}>
                Scheduled start date:{' '}
                <span>{experiment.scheduled_start_date}</span>
              </div>
            )}
            {queuedAfter && !experiment.started_at && (
              <div className={styles.startDate}>
                Starts once{' '}
                <Link href={`/experiment/${queuedAfter.id}`}>
                  {queuedAfter.name}
                </Link>{' '}
                ends.
              </div>
            )}
            {experiment.ended_at && (
              <div className={styles.endDate}>
                Ended at: <span>{experiment.ended_at}</span>
              </div>
            )}
            {!experiment.ended_at && experiment.scheduled_end_date && (
              <div className={styles.endDate}>
                Scheduled end date: <span>{experiment.scheduled_end_date}</span>
              </div>
            )}
          </div>
          <div className={styles.targetPage}>
            <div className={styles.icon}>
              <Page width={15} height={15} />
            </div>
            Target page:{' '}
            <a href={experiment.url} target="_blank" rel="noopener noreferrer">
              {experiment.url}
            </a>
          </div>
        </div>
        <section>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>
              <h3 className={styles.sectionTitle}>Variants</h3>
              <Tooltip
                content={
                  hasStarted
                    ? 'You can not add new variants to an experiment that has already started.'
                    : 'Create a new variant'
                }
                showArrow
                className={styles.tooltip}
                closeDelay={0}
              >
                <span className={styles.tooltipInner}>
                  {creatingVariant ? (
                    <Spinner size={'sm'} />
                  ) : (
                    <CreateButton
                      height={20}
                      className={styles.createButton}
                      onClick={handleCreateVariant}
                      isDisabled={hasStarted}
                    />
                  )}
                </span>
              </Tooltip>
            </div>
            <div>
              <StatsSwitch onSwitch={setStatsType} />
            </div>
          </div>
          <VariantsTable
            variants={experiment.variants}
            experiment={experiment}
            statsType={statsType}
          />
          {/* TODO-p2: Have a line chart with sessions and conversions. Be able to filter by variant if needed */}
        </section>
        {showSetUpGoalModal && (
          <GoalSetupModal
            experiment={experiment}
            onClose={() => setShowSetUpGoalModal(false)}
            goal={goal}
          />
        )}
        {/* <Experiment experiment={experiment} open={true} /> */}
      </div>
    </>
  );
}
