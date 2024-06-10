import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListboxItem, Listbox, cn } from '@nextui-org/react';
import StopButton from '../../../../components/StopButton';
import StopExperimentModal from '../../../../components/Modals/StopExperimentModal';
import DeleteExperimentModal from '../../../../components/Modals/DeleteExperimentModal';
import ExperimentStatusesEnum from '../../../../helpers/enums/ExperimentStatusesEnum';
import Copy from '../../../../icons/Copy';
import Edit2 from '../../../../icons/Edit2';
import Delete2 from '../../../../icons/Delete2';
import styles from './ThreeDotActions.module.css';

const ThreeDotActions = ({ experimentId, status }) => {
  const router = useRouter();
  const [showStopExperimentModal, setShowStopExperimentModal] = useState(false);
  const [showDeleteExperimentModal, setShowDeleteExperimentModal] =
    useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef(null); // Ref to the container div

  const toggleMenu = () => setShowMenu((prevShowMenu) => !prevShowMenu);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);
  const iconClasses =
    'text-xl text-default-500 pointer-events-none flex-shrink-0';
  return (
    <>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.dots} onClick={toggleMenu}>
          <div>.</div>
          <div>.</div>
          <div>.</div>
        </div>
        {showMenu && (
          <div className={styles.listBoxWrapper}>
            <div
              className={`w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100 ${styles.listbox}`}
            >
              <Listbox
                variant="flat"
                aria-label="Listbox menu with descriptions"
              >
                <ListboxItem
                  key="copy"
                  description="Duplicate this experiment"
                  startContent={<Copy className={iconClasses} />}
                >
                  Copy
                </ListboxItem>
                <ListboxItem
                  key="edit"
                  showDivider
                  description="Edit experiment settings"
                  startContent={<Edit2 className={iconClasses} />}
                >
                  {/* TODO-p1: Create settings page w/ settings like: */}
                  {/* -Scheduled end date */}
                  {/* -Auto finalize */}
                  {/* -Start after X finishes (queue) */}
                  {/* -Block other experiments from launching in the page this exp runs */}
                  Settings
                </ListboxItem>
                {status === ExperimentStatusesEnum.PENDING && (
                  <ListboxItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    description="Delete experiment"
                    startContent={
                      <Delete2 className={cn(iconClasses, 'text-danger')} />
                    }
                    onPress={() => setShowDeleteExperimentModal(true)}
                  >
                    Delete
                  </ListboxItem>
                )}
                {(status === ExperimentStatusesEnum.RUNNING ||
                  status === ExperimentStatusesEnum.PAUSED) && (
                  <ListboxItem
                    key="stop"
                    className="text-danger"
                    color="danger"
                    description="Finalize experiment"
                    startContent={<StopButton className={styles.stopButton} />}
                    onPress={() => setShowStopExperimentModal(true)}
                  >
                    Stop
                  </ListboxItem>
                )}
              </Listbox>
            </div>
          </div>
        )}
      </div>
      {showStopExperimentModal && (
        <StopExperimentModal
          onClose={() => setShowStopExperimentModal(false)}
          experimentId={experimentId}
        />
      )}
      {showDeleteExperimentModal && (
        <DeleteExperimentModal
          onClose={() => setShowDeleteExperimentModal(false)}
          experimentId={experimentId}
          onComplete={() => router.push('/dashboard')}
        />
      )}
    </>
  );
};

export default ThreeDotActions;
